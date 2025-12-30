import { render, screen } from '@testing-library/react';
import AdminProductsPage from '@/app/admin/products/page';

// Mock the server component data fetching
// In Next.js App Router, pages are async components.
// We can test them by awaiting them or mocking the data source.

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn().mockReturnValue({
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockResolvedValue({
      data: [
        { id: '1', name: 'Test Product 1', price: 10.99, stock_status: 'in_stock' },
        { id: '2', name: 'Test Product 2', price: 20.00, stock_status: 'out_of_stock' }
      ],
      error: null
    }),
  }),
}));

describe('Admin Products Page', () => {
  it('displays a list of products', async () => {
    // Resolve the async component
    const Page = await AdminProductsPage();
    render(Page);

    expect(screen.getByText('Test Product 1')).toBeInTheDocument();
    expect(screen.getByText('Test Product 2')).toBeInTheDocument();
  });
});
