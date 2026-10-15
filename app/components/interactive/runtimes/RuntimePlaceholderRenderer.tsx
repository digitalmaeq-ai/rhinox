import type {
  InteractiveRuntimeRendererProps,
} from "@/types/interactive-runtime-renderer";

interface RuntimePlaceholderRendererProps
  extends InteractiveRuntimeRendererProps {
  runtimeLabel: string;
}

export default function RuntimePlaceholderRenderer({
  experience,
  runtimeLabel,
}: RuntimePlaceholderRendererProps) {
  return (
    <div className="rx-section">
      <div className="rx-container">
        <div className="rounded-md border border-[#d6e4f5] bg-[#F4FAFE] p-6">
          <p className="rx-content-meta-type">
            {runtimeLabel}
          </p>

          <h2 className="mt-2">
            {experience.title}
          </h2>

          <p className="mt-2 text-[#64748B]">
            This interactive runtime is being prepared
            for this experience.
          </p>
        </div>
      </div>
    </div>
  );
}
