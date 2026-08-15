import LocationPicker from "@/components/location/LocationPicker";

/** State / district / city / pincode selector. */
export default function LocationSelector({ value = {}, onChange, pincodeFirst = true }) {
  return (
    <div data-testid="location-selector">
      <LocationPicker value={value} onChange={onChange} pincodeFirst={pincodeFirst} />
    </div>
  );
}
