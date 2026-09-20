export const clinics = Object.freeze({
  east: "East Community Clinic",
  north: "North Community Clinic",
});

export function initialReferral() {
  return {
    step: "choose",
    destination: "",
    offline: false,
    status: "",
    error: "",
    deliveries: 0,
  };
}

// An in-memory teaching model. No patient information, persistence, or requests.
export function updateReferral(state, action) {
  switch (action.type) {
    case "restart":
      return initialReferral();
    case "choose":
      return state.step === "choose" && Object.hasOwn(clinics, action.value)
        ? { ...state, destination: action.value, error: "" }
        : state;
    case "offline":
      return state.status !== "sent"
        ? { ...state, offline: Boolean(action.value) }
        : state;
    case "review":
      if (state.step !== "choose") return state;
      return Object.hasOwn(clinics, state.destination)
        ? { ...state, step: "review", error: "" }
        : { ...state, error: "Choose a receiving clinic to continue." };
    case "back":
      return state.step === "review" ? { ...state, step: "choose" } : state;
    case "confirm":
      if (state.step !== "review" || !Object.hasOwn(clinics, state.destination))
        return state;
      return {
        ...state,
        step: "confirm",
        status: state.offline ? "queued" : "sent",
        deliveries: state.offline ? 0 : 1,
      };
    case "reconnect":
      return state.step === "confirm" && state.status === "queued"
        ? { ...state, offline: false, status: "sent", deliveries: 1 }
        : state;
    default:
      return state;
  }
}
