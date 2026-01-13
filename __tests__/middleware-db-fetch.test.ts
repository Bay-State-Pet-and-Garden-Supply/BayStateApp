/**
 * @jest-environment node
 */
import { updateSession } from '@/lib/supabase/middleware';
import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';

jest.mock('@supabase/ssr');
const mockCreateServerClient = createServerClient as jest.Mock;

describe('Issue #6: Middleware DB Fetch - FIXED', () => {
    let mockSupabase: any;
    let mockGetUser: jest.Mock;
    let mockFrom: jest.Mock;
    let profilesTableCalls: string[];

    beforeEach(() => {
        jest.clearAllMocks();
        profilesTableCalls = [];

        mockGetUser = jest.fn();
        mockFrom = jest.fn().mockImplementation((table: string) => {
            // Track all calls to any table
            profilesTableCalls.push(table);
            
            // Return a mock that allows chaining
            const mockSelect = jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                    single: jest.fn().mockResolvedValue({ data: { role: 'admin' }, error: null })
                })
            });
            return { select: mockSelect };
        });

        mockSupabase = {
            auth: { getUser: mockGetUser },
            from: mockFrom,
        };
        mockCreateServerClient.mockReturnValue(mockSupabase);
    });

    function createReq(path: string) {
        return new NextRequest(new URL(path, 'http://localhost'));
    }

    it('VERIFIED: middleware NO LONGER performs DB fetch to profiles table (uses JWT instead)', async () => {
        // Setup: User is authenticated with role in JWT app_metadata
        mockGetUser.mockResolvedValue({
            data: { user: { id: 'test-user-id', app_metadata: { role: 'admin' } } },
            error: null
        });

        // Act: Make request to admin route
        const req = createReq('/admin/dashboard');
        await updateSession(req);

        // Assert: NO DB fetch to profiles table was made (role comes from JWT)
        const profilesCalls = profilesTableCalls.filter(t => t === 'profiles');
        expect(profilesCalls.length).toBe(0);
        expect(mockFrom).not.toHaveBeenCalledWith('profiles');
    });

    it('VERIFIED: role is correctly read from JWT app_metadata', async () => {
        // Setup: User with 'staff' role in JWT
        mockGetUser.mockResolvedValue({
            data: { user: { id: 'test-user-id', app_metadata: { role: 'staff' } } },
            error: null
        });

        // Act: Make request to admin route (non-restricted)
        const req = createReq('/admin/products');
        const res = await updateSession(req);

        // Should NOT redirect (staff can access products)
        expect(res.status).not.toBe(307);
    });

    it('VERIFIED: customer role is rejected', async () => {
        // Setup: User with 'customer' role in JWT
        mockGetUser.mockResolvedValue({
            data: { user: { id: 'test-user-id', app_metadata: { role: 'customer' } } },
            error: null
        });

        // Act: Make request to admin route
        const req = createReq('/admin/dashboard');
        const res = await updateSession(req);

        // Assert: Should redirect to login with unauthorized error
        expect(res.status).toBe(307);
        const location = new URL(res.headers.get('location') || '');
        expect(location.pathname).toBe('/login');
        expect(location.searchParams.get('error')).toBe('unauthorized');
    });

    it('VERIFIED: fallback to customer when no role in JWT', async () => {
        // Setup: User with NO role in JWT app_metadata
        mockGetUser.mockResolvedValue({
            data: { user: { id: 'test-user-id', app_metadata: {} } },
            error: null
        });

        // Act: Make request to admin route
        const req = createReq('/admin/dashboard');
        const res = await updateSession(req);

        // Assert: Should redirect (treated as customer)
        expect(res.status).toBe(307);
        const location = new URL(res.headers.get('location') || '');
        expect(location.searchParams.get('message')).toContain('customer');
    });
});
