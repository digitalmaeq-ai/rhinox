"use client";

import InteractiveAssetRenderer from "@/app/components/interactive/InteractiveAssetRenderer";
import CompletionActions, { AllExperiencesLink } from "@/app/components/interactive/shared/CompletionActions";

import type {
  InteractiveRuntimeRendererProps,
} from "@/types/interactive-runtime-renderer";

function humanise(value: string) {
  return value
    .replace(/-/g, " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase(),
    );
}

function answersMatch(
  answer: string | string[] | undefined,
  correctAnswer: string | string[] | undefined,
) {
  if (answer === undefined || correctAnswer === undefined) {
    return false;
  }

  if (Array.isArray(answer) && Array.isArray(correctAnswer)) {
    return (
      answer.length === correctAnswer.length &&
      answer.every((item) =>
        correctAnswer.includes(item),
      )
    );
  }

  return answer === correctAnswer;
}

export default function StandardExperienceRenderer({
  experience,
  runtimeState,
  actions,
}: InteractiveRuntimeRendererProps) {
  const scenes = experience.scenes ?? [];
  const tasks = experience.tasks ?? [];
  const questions = experience.questions ?? [];
  const achievements = experience.achievements ?? [];

  const sceneCount = scenes.length;
  const currentScene =
    scenes[runtimeState.currentScene];

  const currentTask =
    tasks.find(
      (task) =>
        task.sceneId === currentScene?.id &&
        !runtimeState.completedTasks.includes(task.id),
    );

  const completedTaskCount =
    runtimeState.completedTasks.length;

  const requiredTaskCount = tasks.filter(
    (task) => task.required !== false,
  ).length;

  const allRequiredTasksComplete =
    requiredTaskCount > 0 &&
    tasks
      .filter((task) => task.required !== false)
      .every((task) =>
        runtimeState.completedTasks.includes(task.id),
      );

  const isCurrentTaskComplete = currentTask
    ? runtimeState.completedTasks.includes(
        currentTask.id,
      )
    : false;

  const progress =
    tasks.length > 0
      ? Math.round(
          (completedTaskCount / tasks.length) * 100,
        )
      : 0;

  const visibleAssets = (experience.assets ?? []).filter(
    (asset) => asset.visible !== false,
  );

  function handleAssetInteraction(assetId: string) {
    const interactions = (
      experience.interactions ?? []
    ).filter(
      (interaction) =>
        interaction.assetId === assetId &&
        interaction.trigger === "click",
    );

    for (const interaction of interactions) {
      actions.triggerInteraction(interaction.id);
    }
  }

  function handleCompleteTask() {
    if (!currentTask || isCurrentTaskComplete) {
      return;
    }

    actions.completeTask(
      currentTask.id,
      currentTask.points ?? 0,
    );
  }

  function handleCompleteExperience() {
    if (allRequiredTasksComplete) {
      actions.completeExperience();
    }
  }

  function handleQuestionSubmit(
    questionId: string,
    answer: string,
  ) {
    const question = questions.find(
      (item) => item.id === questionId,
    );

    if (!question) {
      return;
    }

    const alreadySubmitted =
      runtimeState.submittedQuestions.includes(
        questionId,
      );

    if (alreadySubmitted) {
      return;
    }

    const correct = answersMatch(
      answer,
      question.correctAnswer,
    );

    actions.submitQuestion(
      questionId,
      answer,
      question.points ?? 0,
      correct,
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rx-content-card">
          <p className="rx-content-meta-type">
            Progress
          </p>
          <p className="text-2xl font-semibold">
            {progress}%
          </p>
        </div>

        <div className="rx-content-card">
          <p className="rx-content-meta-type">
            Scene
          </p>
          <p className="text-2xl font-semibold">
            {sceneCount > 0
              ? `${runtimeState.currentScene + 1} / ${sceneCount}`
              : "0 / 0"}
          </p>
        </div>

        <div className="rx-content-card">
          <p className="rx-content-meta-type">
            Points
          </p>
          <p className="text-2xl font-semibold">
            {runtimeState.points}
          </p>
        </div>

        <div className="rx-content-card">
          <p className="rx-content-meta-type">
            Tasks
          </p>
          <p className="text-2xl font-semibold">
            {completedTaskCount} / {tasks.length}
          </p>
        </div>
      </div>

      <div className="rx-content-card">
        <div className="mb-6">
          <p className="rx-content-meta-type">
            Interactive Workspace
          </p>

          <h2 className="rx-content-card-title">
            {currentScene?.title ?? experience.title}
          </h2>

          {currentScene?.description && (
            <p className="rx-content-card-description">
              {currentScene.description}
            </p>
          )}
        </div>

        {visibleAssets.length > 0 && (
          <div className="mt-8 space-y-4">
            <div>
              <p className="rx-content-meta-type">
                Interactive Areas
              </p>

              <p className="mt-2 text-sm text-[#64748B]">
                Explore the available interactive areas to
                progress through the experience.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {visibleAssets.map((asset) => (
                <InteractiveAssetRenderer
                  key={asset.id}
                  asset={asset}
                  onInteract={() =>
                    handleAssetInteraction(asset.id)
                  }
                />
              ))}
            </div>

            {runtimeState.feedback.length > 0 && (
              <div className="rounded-md border border-[#B9DFF7] bg-[#EDF8FF] p-4">
                <p className="rx-content-meta-type">
                  Feedback
                </p>

                <div className="mt-2 space-y-1">
                  {runtimeState.feedback.map(
                    (message, index) => (
                      <p key={`${message}-${index}`}>
                        {message}
                      </p>
                    ),
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {currentTask && (
          <div className="space-y-4">
            <div>
              <p className="rx-content-meta-type">
                Current Task
              </p>

              <h3 className="rx-content-card-title">
                {currentTask.title}
              </h3>

              {currentTask.description && (
                <p className="rx-content-card-description">
                  {currentTask.description}
                </p>
              )}
            </div>

            {currentTask.instructions &&
              currentTask.instructions.length > 0 && (
                <ol className="list-decimal space-y-2 pl-5">
                  {currentTask.instructions.map(
                    (instruction) => (
                      <li key={instruction}>
                        {instruction}
                      </li>
                    ),
                  )}
                </ol>
              )}

            {currentTask.points !== undefined && (
              <p className="rx-content-meta-type">
                {currentTask.points} points available
              </p>
            )}

            <button
              type="button"
              className="rx-button rx-button-primary"
              onClick={handleCompleteTask}
              disabled={
                isCurrentTaskComplete ||
                runtimeState.completed
              }
            >
              {isCurrentTaskComplete
                ? "Task completed"
                : "Complete task"}
            </button>
          </div>
        )}

        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            className="rx-button rx-button-secondary"
            onClick={actions.previousScene}
            disabled={
              runtimeState.currentScene === 0 ||
              runtimeState.completed
            }
          >
            Previous
          </button>

          <button
            type="button"
            className="rx-button rx-button-primary"
            onClick={actions.nextScene}
            disabled={
              sceneCount === 0 ||
              runtimeState.currentScene >=
                sceneCount - 1 ||
              runtimeState.completed
            }
          >
            Next
          </button>

          {allRequiredTasksComplete &&
            runtimeState.currentScene === sceneCount - 1 &&
            !runtimeState.completed && (
              <button
                type="button"
                className="rx-button rx-button-primary"
                onClick={handleCompleteExperience}
              >
                Complete experience
              </button>
            )}

          {/* Way back to the library, always at hand until the completion
              panel below takes over. */}
          {!runtimeState.completed && <AllExperiencesLink />}
        </div>

        {runtimeState.completed && (
          <div className="mt-6 space-y-5">
            <div>
              <p className="rx-content-meta-type">
                Experience complete
              </p>

              <p>
                {experience.title} completed. You earned{" "}
                {runtimeState.points} points.
              </p>
            </div>

            <CompletionActions onTryAgain={actions.resetExperience} />

            {runtimeState.achievementsUnlocked.length > 0 && (
              <div>
                <p className="rx-content-meta-type">
                  Achievements unlocked
                </p>

                <div className="mt-3 space-y-3">
                  {achievements
                    .filter((achievement) =>
                      runtimeState.achievementsUnlocked.includes(
                        achievement.id,
                      ),
                    )
                    .map((achievement) => (
                      <div
                        key={achievement.id}
                        className="rounded-md border border-[#d6e4f5] bg-[#F4FAFE] p-4"
                      >
                        <h3 className="font-semibold">
                          {achievement.title}
                        </h3>

                        <p className="mt-1 text-sm text-[#64748B]">
                          {achievement.description}
                        </p>

                        {achievement.points !== undefined && (
                          <p className="mt-2 rx-content-meta-type">
                            {achievement.points} points
                          </p>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            )}

            <button
              type="button"
              className="rx-button rx-button-secondary"
              onClick={actions.resetExperience}
            >
              Restart experience
            </button>
          </div>
        )}
      </div>

      {questions.length > 0 && (
        <section className="space-y-5">
          <div>
            <p className="rx-content-meta-type">
              Knowledge Check
            </p>

            <h2 className="rx-content-card-title">
              Test what you have learned
            </h2>
          </div>

          {questions.map((question) => {
            const answer =
              runtimeState.answers[question.id];

            const submitted = runtimeState.submittedQuestions.includes(
              question.id,
            );

            const correct = submitted
              ? answersMatch(
                  answer,
                  question.correctAnswer,
                )
              : false;

            return (
              <article
                key={question.id}
                className="rx-content-card"
              >
                <h3 className="rx-content-card-title">
                  {question.question}
                </h3>

                {question.options &&
                  question.options.length > 0 && (
                    <div className="mt-5 space-y-3">
                      {question.options.map(
                        (option) => {
                          const selected =
                            answer === option.id;

                          return (
                            <button
                              key={option.id}
                              type="button"
                              className={`block w-full rounded-md border p-4 text-left transition ${
                                selected
                                  ? "border-[#0f6fde] bg-[#EDF8FF]"
                                  : "border-[#d6e4f5] bg-white"
                              }`}
                              onClick={() =>
                                handleQuestionSubmit(
                                  question.id,
                                  option.id,
                                )
                              }
                              disabled={submitted}
                            >
                              {option.text}
                            </button>
                          );
                        },
                      )}
                    </div>
                  )}

                {submitted && (
                  <div className="mt-5">
                    <p className="rx-content-meta-type">
                      {correct
                        ? "Correct"
                        : "Not quite"}
                    </p>

                    {question.explanation && (
                      <p className="mt-2">
                        {question.explanation}
                      </p>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </section>
      )}

      {experience.modes.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {experience.modes.map((mode) => (
            <span
              key={mode}
              className="rx-content-meta-type"
            >
              {humanise(mode)}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}












