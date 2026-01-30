import { render, screen } from '@testing-library/react';
import App from './App';

test('renders draft practice title', async () => {
  render(<App />);
  const title = await screen.findByText(/LoL Draft Practice/i);
  expect(title).toBeInTheDocument();
});
