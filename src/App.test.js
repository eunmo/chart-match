import { render } from '@testing-library/react';
import App from './App';

test('renders nav bar', () => {
  const { getByText } = render(<App />);
  const linkElement = getByText(/Chart Match/i);
  expect(linkElement).toBeInTheDocument();
});
