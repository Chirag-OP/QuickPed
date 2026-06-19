interface StepIndicatorProps {
  currentStep: number;
  totalSteps?: number;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({
  currentStep,
  totalSteps = 4,
}) => {
  return (
    <div className="flex justify-center items-center gap-2 mb-10">
      {Array.from({ length: totalSteps }).map((_, index) => (
        <div
          key={index}
          className={`transition-all duration-300 rounded-full ${
            index === currentStep
              ? "w-8 h-2 bg-orange-500"
              : "w-2 h-2 bg-orange-300"
          }`}
        />
      ))}
    </div>
  );
};