interface SliderProps {
  value: number;
  onChange: (value: number) => void;
}

function Slider({ value, onChange }: SliderProps) {
  return (
    <div className="w-full gap-2 border-4 border-black bg-yellow-100 p-6 text-center">
      <input
        type="range"
        min={0}
        max={100}
        step={1}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-4 w-full cursor-pointer appearance-none border-2 border-black bg-white [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-10 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-black [&::-webkit-slider-thumb]:!bg-cyan-400"
      />
      <span className="text-2xl text-black">{value}%</span>
    </div>
  );
}

export default Slider;
