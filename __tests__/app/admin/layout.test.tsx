import { render, screen } from '@testing-library/react';
import AdminLayout from '@/app/admin/layout';

// Mock the children
jest.mock('react', () => {
  const originalReact = jest.requireActual('react');
  return {
    ...originalReact,
    // StartTransition is needed for some next.js stuff, but usually handled by env
  };
});

describe('Admin Layout', () => {
  it('renders side navigation with links', () => {
    render(
      <AdminLayout>
        <div>Content</div>
      </AdminLayout>
    );

    expect(screen.getByRole('link', { name: /products/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /services/i })).toBeInTheDocument();
    // expect(screen.getByRole('link', { name: /orders/i })).toBeInTheDocument(); // Maybe later
  });
});
