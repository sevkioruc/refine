import React from "react";
import { useTutorialChecklists } from "../../hooks/use-tutorial-checklists";

type Props = {
    id: string;
    width: string;
    height: string;
};

export const TutorialCircle: React.FC<Props> = ({
    id: tutorialId,
    width = "100px",
    height = "100px",
}) => {
    const { items } = useTutorialChecklists();

    const tutorialItem = items.find((el) => el.id === tutorialId);

    const tutorialChecks = tutorialItem?.checklist || [];

    const tutorialCheckStatuses = tutorialChecks.map((item) => {
        const completed = item.checked;
        return {
            ...item,
            status: completed ? "completed" : "not-started",
        };
    });

    const r = 45;
    const cx = 50;
    const cy = 50;
    const strokeWidth = 10;
    const standardOffsetLength = 20;
    const emptyColor = "#718096";
    const completedColor = "#48bb78";

    const parts = tutorialCheckStatuses.length;

    const circumference = 2 * Math.PI * r;

    const arcAngle = 360 / parts;
    const arcLength = (circumference / 360) * arcAngle;

    const alignmentOffsetArcAngle = 90 - arcAngle;
    const alignmentOffsetArcLength =
        (circumference / 360) * alignmentOffsetArcAngle;

    const offsetDeviationRate = 1 / 2;
    const standardOffsetDeviation = standardOffsetLength * offsetDeviationRate;

    const offsetForSingle = (index: number) =>
        arcLength * index * -1 + arcLength;

    const baseOffset = alignmentOffsetArcLength - standardOffsetDeviation;

    const dash = arcLength - standardOffsetLength;
    const gapForEach = standardOffsetLength;
    const gapForSingle = circumference - arcLength + standardOffsetLength;

    const dashArrayMultiple = `${dash} ${gapForEach}`;
    const dashArraySingle = `${dash} ${gapForSingle}`;

    const dashOffsetMultiple = baseOffset;

    const dashOffsetSingle = (index: number) =>
        offsetForSingle(index) + baseOffset;

    return (
        <svg width={width} height={height} viewBox="0 0 100 100">
            <circle
                className="empty-dashes"
                cx={cx}
                cy={cy}
                r={r}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={strokeWidth}
                strokeDasharray={dashArrayMultiple}
                strokeDashoffset={dashOffsetMultiple}
                style={{
                    stroke: "var(--tutorial-toc-text-color-light)",
                }}
            />
            {tutorialCheckStatuses.map((item, index) => {
                if (item.status === "completed") {
                    return (
                        <circle
                            key={index}
                            className="filled-dash"
                            cx={cx}
                            cy={cy}
                            r={r}
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            stroke={completedColor}
                            strokeWidth={strokeWidth}
                            strokeDasharray={dashArraySingle}
                            strokeDashoffset={dashOffsetSingle(index)}
                        />
                    );
                }
                return null;
            })}
        </svg>
    );
};
