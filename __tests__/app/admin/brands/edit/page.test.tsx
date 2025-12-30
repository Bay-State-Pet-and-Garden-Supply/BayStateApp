import { render, screen } from '@testing-library/react';
import EditBrandPage from '@/app/admin/brands/[id]/edit/page';

// Mock the server component data fetching
jest.mock('@/lib/supabase/server', () => ({
    createClient: jest.fn().mockReturnValue({
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
            data: { id: '1', name: 'Test Brand', slug: 'test-brand', logo_url: null, created_at: '2024-01-01' },
            error: null
        }),
    }),
}));

// Mock useRouter
jest.mock('next/navigation', () => ({
    useRouter: jest.fn().mockReturnValue({
        push: jest.fn(),
        refresh: jest.fn(),
    }),
}));

describe('Admin Edit Brand Page', () => {
    const mockParams = { id: '1' };

    it('displays form with pre-filled name', async () => {
        const Page = await EditBrandPage({ params: Promise.resolve(mockParams) });
        render(Page);

        expect(screen.getByDisplayValue('Test Brand')).toBeInTheDocument();
    });

    it('displays form with pre-filled slug', async () => {
        const Page = await EditBrandPage({ params: Promise.resolve(mockParams) });
        render(Page);

        expect(screen.getByDisplayValue('test-brand')).toBeInTheDocument();
    });

    it('displays update button', async () => {
        const Page = await EditBrandPage({ params: Promise.resolve(mockParams) });
        render(Page);

        expect(screen.getByRole('button', { name: /update brand/i })).toBeInTheDocument();
    });

    it('displays page title', async () => {
        const Page = await EditBrandPage({ params: Promise.resolve(mockParams) });
        render(Page);

        expect(screen.getByRole('heading', { name: /edit brand/i })).toBeInTheDocument();
    });
});
