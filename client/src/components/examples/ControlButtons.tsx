import ControlButtons from '../ControlButtons';

export default function ControlButtonsExample() {
  return (
    <div className="p-8 bg-background">
      <ControlButtons 
        state="running"
        onStart={() => {}}
        onPause={() => {}}
        onStop={() => {}}
        onReset={() => {}}
        onSettings={() => {}}
      />
    </div>
  );
}