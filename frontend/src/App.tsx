import { useEffect, useState } from 'react';
import { LastDoc, Message, StatsBarProps, ActionMessage, Prediction } from '../../shared/types';
import Controls from './components/Controls';
import MessageCard from './components/MessageCard';
import Slider from './components/Slider';
import StatsBar from './components/StatsBar';
import Toggler from './components/Toggler';

function App() {
  const [selectedValidatedStatus, setSelectedValidatedStatus] = useState<string>('Unvalidated');
  const [selectedLabel, setSelectedLabel] = useState<string>('All');
  const [selectedOrder, setSelectedOrder] = useState<string>('Spam');
  const [confidence, setConfidence] = useState<number>(90);
  const [submitted, setSubmitted] = useState<boolean>(false);

  // Firestore
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [lastDoc, setLastDoc] = useState<LastDoc | undefined>(undefined);
  const [stats, setStats] = useState<StatsBarProps>({
    spam: -1,
    ham: -1,
    validated: -1,
    sessionValidated: 0,
  });
  const [batchToWrite, setBatchToWrite] = useState<ActionMessage[]>([]);
  const [sessionValidated, setSessionValidated] = useState<number>(0);

  const fetchStats = async () => {
    const res = await fetch('http://localhost:3000/api/message_counts');
    return res.json() as Promise<StatsBarProps>;
  };

  const fetchMessages = async (reset = false, lastDoc?: LastDoc) => {
    setIsLoading(true);
    try {
      if (reset) {
        setMessages([]);
        setLastDoc(undefined);
      }

      const res = await fetch('http://localhost:3000/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messageFilters: {
            validatedStatus: selectedValidatedStatus,
            labelType: selectedLabel,
            sortOrder: selectedOrder,
            maxConfidence: confidence,
          },
          lastDoc,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server error: ${res.statusText}`);
      }

      const data = (await res.json()) as { messages: Message[]; lastDoc?: LastDoc };

      if (data.messages.length === 0) {
        return;
      }

      setMessages((prev) => (reset ? data.messages : [...prev, ...data.messages]));
      setLastDoc(data.lastDoc);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const writeBatch = async (batch: ActionMessage[]) => {
    try {
      const res = await fetch('http://localhost:3000/api/write_batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(batch),
      });

      if (!res.ok) {
        throw new Error(`Server error: ${res.statusText}`);
      }
    } catch (error) {
      console.error('Failed to write batch:', error);
    }
  };

  const handleFormSubmit = async () => {
    setSubmitted(true);
    await fetchMessages(true);
  };

  useEffect(() => {
    fetchStats()
      .then((fetchedStats) => {
        setStats(fetchedStats);
      })
      .catch((err) => {
        console.error('Error fetching stats:', err);
      });
  }, []);

  const handleDelete = () => {
    setBatchToWrite((prev) => [
      ...prev,
      { message: messages[0], action: 'delete' } as ActionMessage,
    ]);
    setMessages(messages.slice(1));
    setSessionValidated(sessionValidated + 1);
  };

  useEffect(() => {
    if (messages.length === 0 && batchToWrite.length > 0) {
      const batchCopy = [...batchToWrite];
      setBatchToWrite([]);
      void writeBatch(batchCopy);
      const fetchMessagesAsync = async () => {
        await fetchMessages(false, lastDoc as LastDoc);
      };
      void fetchMessagesAsync();
    }
  }, [messages.length]);

  const handleValidate = (label: Prediction) => {
    setBatchToWrite((prev) => [
      ...prev,
      { message: messages[0], action: 'validate', validation: label } as ActionMessage,
    ]);
    setMessages(messages.slice(1));
    setSessionValidated(sessionValidated + 1);
  };

  const handleNext = () => {
    setMessages((prev) => {
      if (prev.length === 0) return prev;

      const [first, ...rest] = prev;
      return [...rest, first];
    });
  };

  return (
    <>
      <header className="max-w-1/2 my-10 mb-auto border-2 bg-teal-100 p-4 text-center md:p-10">
        <h1 className="text-2xl font-bold text-gray-600 md:text-4xl">
          Hadhari Validation Interface
        </h1>
      </header>
      <StatsBar
        spam={stats.spam}
        ham={stats.ham}
        validated={stats.validated}
        sessionValidated={sessionValidated}
      />

      {submitted ? (
        <>
          <h1 className="text-2xl font-bold">Messages</h1>
          {isLoading ? (
            <p className="animate-pulse text-gray-500">Loading messages...</p>
          ) : messages.length > 0 ? (
            <div className="max-w-11/12 flex flex-col items-center gap-2">
              <MessageCard key={messages[0].id} message={messages[0]} type="active" />
              <Controls
                message={messages[0]}
                onDelete={handleDelete}
                onValidate={handleValidate}
                onNext={handleNext}
              />
              <div className="h-4 w-full bg-black"></div>
              {batchToWrite.map((actionMessage) => (
                <>
                  <MessageCard key={actionMessage.message.id} message={actionMessage.message} />
                  <Toggler
                    labels={['DELETE', 'Spam', 'Ham']}
                    selected={
                      actionMessage.action === 'delete' ? 'DELETE' : actionMessage.validation
                    }
                    onChange={(selected) => {
                      if (selected === 'DELETE') {
                        setBatchToWrite((prev) =>
                          prev.map((item) =>
                            item.message.id === actionMessage.message.id
                              ? {
                                  ...item,
                                  action: 'delete',
                                }
                              : item
                          )
                        );
                      } else {
                        const prediction = selected as Prediction;
                        setBatchToWrite((prev) =>
                          prev.map((item) =>
                            item.message.id === actionMessage.message.id
                              ? {
                                  ...item,
                                  action: 'validate',
                                  validation: prediction,
                                }
                              : item
                          )
                        );
                      }
                    }}
                  />
                </>
              ))}
              <div className="h-4 w-full bg-black"></div>
              {messages.slice(1).map((message) => (
                <MessageCard key={message.id} message={message} />
              ))}
            </div>
          ) : (
            <button
              onClick={() => {
                void (async () => {
                  await fetchMessages(false, lastDoc);
                })();
              }}
            >
              {'Write and get next batch'}
            </button>
          )}
        </>
      ) : (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void (async () => {
              try {
                await handleFormSubmit();
              } catch (err) {
                console.error('Error during form submission:', err);
              }
            })();
          }}
          className="lg:max-w-1/2 relative mb-auto mt-0.5 grid w-10/12 grid-cols-2 border-4 border-black bg-slate-50 py-10 text-sm font-bold uppercase tracking-wide text-amber-500 md:w-11/12 md:gap-5 md:p-10"
        >
          <div className="justify-items-center">
            Validated Status
            <Toggler
              labels={['Unvalidated', 'Validated', 'All']}
              selected={selectedValidatedStatus}
              onChange={(selected) => setSelectedValidatedStatus(selected as string)}
            />
          </div>
          <div className="justify-items-center">
            Label
            <Toggler
              labels={['Spam', 'Ham', 'All']}
              selected={selectedLabel}
              onChange={(selected) => setSelectedLabel(selected as string)}
            />
          </div>
          <div className="justify-items-center">
            Order
            <Toggler
              labels={['Spam', 'Ham', 'Unordered']}
              selected={selectedOrder}
              onChange={(selected) => setSelectedOrder(selected as string)}
            />
          </div>
          <label className="mr-0.5">
            Max Confidence
            <Slider value={confidence} onChange={setConfidence} />
          </label>
          <button
            type="submit"
            className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 border-4 border-black bg-red-500 p-3 font-extrabold text-yellow-300 ring-black hover:cursor-pointer hover:bg-red-600 hover:ring-4 active:scale-90 md:text-2xl"
          >
            Start
          </button>
        </form>
      )}

      <div className="-skew-12 absolute bottom-1/3 -z-10 w-[200%]">
        <div className="h-12 w-full border-2 bg-cyan-900"></div>
        <div className="h-12 w-full border-b-2 bg-red-500"></div>
        <div className="h-12 w-full bg-teal-300"></div>
        <div className="h-12 w-full border-2 bg-yellow-300"></div>
      </div>
    </>
  );
}

export default App;
