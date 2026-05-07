import { Label } from "@/components/ui/label";
import {
  getRegionDisplayLabel,
  getSubRegionsForRegion,
  KOREA_SIDO,
  normalizeRegionSelection,
} from "@/lib/regions";
import { cn } from "@/lib/utils";

export interface RegionSelectionValue {
  region: string;
  subRegion: string;
}

interface RegionSelectFieldsProps {
  value: RegionSelectionValue;
  onChange: (value: RegionSelectionValue) => void;
  regionId?: string;
  subRegionId?: string;
  regionLabel?: string;
  subRegionLabel?: string;
  regionPlaceholder?: string;
  subRegionPlaceholder?: string;
  regionError?: string;
  subRegionError?: string;
  className?: string;
  inline?: boolean;
}

export function RegionSelectFields({
  value,
  onChange,
  regionId = "region",
  subRegionId = "subRegion",
  regionLabel = "거점 지역",
  subRegionLabel = "세부 지역",
  regionPlaceholder = "선택 안 함",
  subRegionPlaceholder = "선택 안 함",
  regionError,
  subRegionError,
  className,
  inline = false,
}: RegionSelectFieldsProps) {
  const normalizedSelection = normalizeRegionSelection(value.region, value.subRegion);
  const subRegionOptions = getSubRegionsForRegion(normalizedSelection.region);

  return (
    <div className={cn("grid gap-4 sm:grid-cols-2", className)}>
      <div className="space-y-2">
        <Label htmlFor={regionId}>{regionLabel}</Label>
        <select
          id={regionId}
          value={normalizedSelection.region}
          onChange={(event) =>
            onChange({
              region: event.target.value,
              subRegion: "",
            })
          }
          className={cn(
            "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
            inline && "h-10",
            !normalizedSelection.region && "text-muted-foreground",
          )}
        >
          <option value="">{regionPlaceholder}</option>
          {KOREA_SIDO.map((region) => (
            <option key={region} value={region}>
              {getRegionDisplayLabel(region)}
            </option>
          ))}
        </select>
        {regionError ? <p className="text-xs text-destructive">{regionError}</p> : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor={subRegionId}>{subRegionLabel}</Label>
        <select
          id={subRegionId}
          value={normalizedSelection.subRegion}
          onChange={(event) =>
            onChange({
              region: normalizedSelection.region,
              subRegion: event.target.value,
            })
          }
          disabled={!normalizedSelection.region}
          className={cn(
            "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50",
            inline && "h-10",
            !normalizedSelection.subRegion && "text-muted-foreground",
          )}
        >
          <option value="">{subRegionPlaceholder}</option>
          {subRegionOptions.map((subRegion) => (
            <option key={subRegion} value={subRegion}>
              {subRegion}
            </option>
          ))}
        </select>
        {subRegionError ? <p className="text-xs text-destructive">{subRegionError}</p> : null}
      </div>
    </div>
  );
}
