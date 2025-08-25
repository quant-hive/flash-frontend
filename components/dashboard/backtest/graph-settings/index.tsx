import { CustomCheckbox } from "@/components/custom-checkbox";
import {
  CustomRadioGroup,
  CustomRadioGroupItem,
} from "@/components/custom-radio-group";
import { Label } from "@/components/ui/label";
import React from "react";

const GraphSettings = ({
  showLabels,
  showGridLines,
  /* gridStyle, */
  onShowLabel,
  onShowGridLines,
}: /* onChangeGridStyle, */
{
  showLabels: boolean;
  showGridLines: boolean;
  /* gridStyle: "dotted" | "dashed"; */
  onShowLabel: (value: boolean) => void;
  onShowGridLines: (value: boolean) => void;
  /* onChangeGridStyle: (value: "dotted" | "dashed") => void; */
}) => {
  return (
    <div className="flex flex-col select-none">
      <div>Settings</div>
      <div className="flex flex-col mt-2">
        <p className="text-sm text-[#909092]">Graph</p>
        <div className="flex flex-col mt-2 gap-2">
          <div className="flex flex-row items-center gap-2">
            <CustomCheckbox
              id="show-axis-labels"
              checked={showLabels}
              onClick={() => onShowLabel(!showLabels)}
            ></CustomCheckbox>
            <Label
              htmlFor="show-axis-labels"
              className="text-sm text-[#909092] bg-clip-text bg-blue_text_legend_gradient text-transparent"
            >
              Show labels for axis
            </Label>
          </div>

          <div className="flex flex-row items-center gap-2">
            <CustomCheckbox
              id="show-grid-lines"
              checked={showGridLines}
              onClick={() => onShowGridLines(!showGridLines)}
            ></CustomCheckbox>
            <Label
              htmlFor="show-grid-lines"
              className="text-sm text-[#909092] bg-clip-text bg-blue_text_legend_gradient text-transparent"
            >
              View Grid Lines
            </Label>
          </div>
        </div>
      </div>

      {/* <div
        className={`flex flex-col mt-2 ${
          !showGridLines && "pointer-events-none opacity-50"
        }`}
      >
        <p className="text-sm text-[#909092]">Grid Lines</p>
        <CustomRadioGroup
          className="flex flex-col mt-2 gap-2"
          defaultValue={gridStyle}
          onChange={(e) =>
            onChangeGridStyle(
              (e.target as HTMLInputElement).value as "dotted" | "dashed"
            )
          }
        >
          <div className="flex flex-row items-center gap-2">
            <CustomRadioGroupItem
              value="dotted"
              id="show-dotted-grid"
            ></CustomRadioGroupItem>
            <Label
              htmlFor="show-dotted-grid"
              className="text-sm text-[#909092] bg-clip-text bg-blue_text_legend_gradient text-transparent"
            >
              Dotted
            </Label>
          </div>

          <div className="flex flex-row items-center gap-2">
            <CustomRadioGroupItem
              value="dashed"
              id="show-dashed-grid"
            ></CustomRadioGroupItem>
            <Label
              htmlFor="show-dashed-grid"
              className="text-sm text-[#909092] bg-clip-text bg-blue_text_legend_gradient text-transparent"
            >
              Dashed
            </Label>
          </div>
        </CustomRadioGroup>
      </div> */}
    </div>
  );
};

export default GraphSettings;
