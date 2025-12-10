# Custom React Hooks

This directory contains custom React hooks that provide easy-to-use interfaces for managing application state and API interactions.

## Available Hooks

### `useLeads`
Manages lead data with CRUD operations.

```tsx
import { useLeads } from '@/hooks';

function LeadsPage() {
  const { leads, loading, error, createLead, updateLead, deleteLead } = useLeads();

  const handleCreateLead = async () => {
    await createLead({
      email: 'john@example.com',
      name: 'John Doe',
      company: 'Acme Inc',
      source: 'website'
    });
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {leads.map(lead => (
        <div key={lead.id}>{lead.name} - {lead.company}</div>
      ))}
    </div>
  );
}
```

### `useConversations`
Handles chat conversations and AI interactions.

```tsx
import { useConversations } from '@/hooks';

function ChatInterface({ conversationId }: { conversationId: string }) {
  const { sendMessage, getConversation } = useConversations();
  const [messages, setMessages] = useState([]);

  const handleSendMessage = async (message: string) => {
    const response = await sendMessage(conversationId, message);
    // Handle streaming response
  };

  return (
    <div>
      {/* Chat UI */}
    </div>
  );
}
```

### `useAnalytics`
Fetches and manages dashboard analytics.

```tsx
import { useAnalytics } from '@/hooks';

function AnalyticsDashboard() {
  const { data, loading, refreshAnalytics } = useAnalytics('30d');

  if (loading) return <div>Loading analytics...</div>;

  return (
    <div>
      <h2>Total Leads: {data?.totalLeads}</h2>
      <h2>Conversion Rate: {data?.conversionRate}%</h2>
      <button onClick={refreshAnalytics}>Refresh</button>
    </div>
  );
}
```

### `useCalendar`
Manages meeting scheduling and calendar operations.

```tsx
import { useCalendar } from '@/hooks';

function MeetingScheduler({ leadId }: { leadId: string }) {
  const { getAvailableSlots, scheduleMeeting, loading } = useCalendar();
  const [slots, setSlots] = useState([]);

  const loadSlots = async () => {
    const availableSlots = await getAvailableSlots(new Date());
    setSlots(availableSlots);
  };

  const handleSchedule = async (slot: TimeSlot) => {
    await scheduleMeeting(leadId, slot.start, 30, 'meeting');
  };

  return (
    <div>
      {slots.map(slot => (
        <button key={slot.start.toISOString()} onClick={() => handleSchedule(slot)}>
          {slot.start.toLocaleTimeString()}
        </button>
      ))}
    </div>
  );
}
```

### `useAIProviders`
Manages AI provider status and switching.

```tsx
import { useAIProviders } from '@/hooks';

function AIProviderSettings() {
  const { data, switchProvider, getCurrentProvider } = useAIProviders();
  const currentProvider = getCurrentProvider();

  return (
    <div>
      <h3>Current Provider: {currentProvider?.name}</h3>
      {data?.providerStatus.map(provider => (
        <button
          key={provider.name}
          onClick={() => switchProvider(provider.name)}
          disabled={!provider.enabled || provider.current}
        >
          {provider.name} {provider.current && '(Current)'}
        </button>
      ))}
    </div>
  );
}
```

### `useLocalStorage`
Persistent local storage with TypeScript support.

```tsx
import { useLocalStorage } from '@/hooks';

function UserPreferences() {
  const [theme, setTheme] = useLocalStorage('theme', 'light');
  const [sidebarOpen, setSidebarOpen] = useLocalStorage('sidebarOpen', true);

  return (
    <div>
      <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
        Toggle Theme ({theme})
      </button>
      <button onClick={() => setSidebarOpen(!sidebarOpen)}>
        Toggle Sidebar ({sidebarOpen ? 'Open' : 'Closed'})
      </button>
    </div>
  );
}
```

### `useDebounce`
Performance optimization for search and input handling.

```tsx
import { useDebounce, useDebouncedCallback } from '@/hooks';
import { useState } from 'react';

function SearchComponent() {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const debouncedSearch = useDebouncedCallback((term: string) => {
    // Perform search API call
    console.log('Searching for:', term);
  }, 300);

  // This effect will run when debouncedSearchTerm changes
  useEffect(() => {
    if (debouncedSearchTerm) {
      // Perform search
    }
  }, [debouncedSearchTerm]);

  return (
    <input
      type="text"
      value={searchTerm}
      onChange={(e) => {
        setSearchTerm(e.target.value);
        debouncedSearch(e.target.value);
      }}
      placeholder="Search leads..."
    />
  );
}
```

## Hook Patterns

All hooks follow consistent patterns:

1. **Loading States**: Most hooks provide a `loading` boolean
2. **Error Handling**: Hooks include `error` state for error messages
3. **Async Operations**: Functions return promises for async operations
4. **Real-time Updates**: Hooks automatically refresh data when needed
5. **TypeScript Support**: Full type safety with TypeScript interfaces

## Best Practices

1. **Use hooks at the top level** of your components
2. **Handle loading and error states** in your UI
3. **Combine hooks** for complex functionality
4. **Memoize expensive operations** when using multiple hooks
5. **Follow React hooks rules** (don't call in loops, conditions, etc.)

## Contributing

When adding new hooks:

1. Follow the existing naming convention (`use-[feature].ts`)
2. Include TypeScript interfaces for all data types
3. Provide loading and error states
4. Add comprehensive JSDoc comments
5. Update this README with usage examples