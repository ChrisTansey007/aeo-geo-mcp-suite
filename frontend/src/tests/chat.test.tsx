import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Chat from '../chat/Chat';
import ChatInput from '../chat/ChatInput';
import { vi } from 'vitest';

const sendMessage = vi.fn().mockResolvedValue(undefined);
const runCommand = vi.fn().mockResolvedValue(undefined);
const messages: any[] = [];

vi.mock('../state/useChatStore', () => ({
  useChatStore: (selector: any) =>
    selector({
      messages,
      sendMessage,
      runCommand,
      copyMessage: vi.fn(),
      retryMessage: vi.fn(),
      forkConversation: vi.fn(),
    }),
}));

describe('Chat components', () => {
  beforeEach(() => {
    messages.length = 0;
    sendMessage.mockClear();
    runCommand.mockClear();
  });

  it('renders messages in Chat', () => {
    messages.push({ id: '1', role: 'user', content: 'hello' });
    render(<Chat />);
    expect(screen.getByText('hello')).toBeInTheDocument();
  });

  it('sends message on submit', async () => {
    render(<ChatInput />);
    const input = screen.getByPlaceholderText('Type message or /command');
    await userEvent.type(input, 'hi');
    await userEvent.click(screen.getByText('Send'));
    expect(sendMessage).toHaveBeenCalledWith('hi', []);
  });

  it('runs command when starting with slash', async () => {
    render(<ChatInput />);
    const input = screen.getByPlaceholderText('Type message or /command');
    await userEvent.type(input, '/crawl https://example.com');
    await userEvent.click(screen.getByText('Send'));
    expect(runCommand).toHaveBeenCalledWith('/crawl https://example.com', []);
  });
});
