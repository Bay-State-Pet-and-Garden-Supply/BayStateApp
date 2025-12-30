import { render, screen } from '@testing-library/react';
import NewBrandPage from '@/app/admin/brands/new/page';

// Mock useRouter
jest.mock('next/navigation', () => ({
    useRouter: jest.fn().mockReturnValue({
        push: jest.fn(),
        refresh: jest.fn(),
    }),
}));

// Mock the Supabase client
jest.mock('@/lib/supabase/client', () => ({
    createClient: jest.fn().mockReturnValue({
        from: jest.fn().mockReturnThis(),
        insert: jest.fn().mockResolvedValue({ error: null }),
    }),
}));

describe('Admin New Brand Page', () => {
    it('displays form with name input', () => {
        render(<NewBrandPage />);

        expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    });

    it('displays form with slug input', () => {
        render(<NewBrandPage />);

        expect(screen.getByLabelText(/slug/i)).toBeInTheDocument();
    });

    it('displays submit button', () => {
        render(<NewBrandPage />);

        expect(screen.getByRole('button', { name: /create brand/i })).toBeInTheDocument();
    });

    it('displays page title', () => {
        render(<NewBrandPage />);

        expect(screen.getByRole('heading', { name: /add brand/i })).toBeInTheDocument();
    });
});
