import { useState } from 'react';
import Toggler from './components/Toggler';
import Slider from './components/Slider';

function App() {
  const [selectedValidated, setSelectedValidated] = useState<string>('False');
  const [selectedLabel, setSelectedLabel] = useState<string>('Both');
  const [selectedOrder, setSelectedOrder] = useState<string>('Spam');
  const [confidence, setConfidence] = useState<number>(90);

  return (
    <>
      <header className="z-30 my-10 mb-auto max-w-1/2 border-2 bg-teal-100 p-4 text-center md:p-10">
        <h1 className="text-2xl font-bold text-gray-600 md:text-4xl">
          Hadhari Validation Interface
        </h1>
      </header>
      <form
        action=""
        className="relative z-30 mt-0.5 mb-auto grid w-10/12 grid-cols-2 border-4 border-black bg-slate-50 py-10 text-sm font-bold tracking-wide text-amber-500 uppercase md:w-11/12 md:gap-5 md:p-10 lg:max-w-1/2"
      >
        <div className="justify-items-center">
          Validated
          <Toggler
            labels={['False', 'True', 'False/True']}
            selected={selectedValidated}
            onChange={(selected) => setSelectedValidated(selected as string)}
          />
        </div>
        <div className="justify-items-center">
          Label
          <Toggler
            labels={['Spam', 'Ham', 'Both']}
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
          Confidence
          <Slider value={confidence} onChange={setConfidence} />
        </label>
        <button
          type="submit"
          className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 border-4 border-black bg-red-500 p-3 font-extrabold text-yellow-300 ring-black hover:cursor-pointer hover:bg-red-600 hover:ring-4 active:scale-90 md:text-2xl"
        >
          Start
        </button>
      </form>
      <div className="absolute bottom-1/3 z-20 w-[200%] -skew-12">
        <div className="h-12 w-full border-2 bg-cyan-900"></div>
        <div className="h-12 w-full border-b-2 bg-red-500"></div>
        <div className="h-12 w-full bg-teal-300"></div>
        <div className="h-12 w-full border-2 bg-yellow-300"></div>
      </div>
    </>
  );
}

export default App;
