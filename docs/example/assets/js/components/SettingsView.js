import { h3, h } from "../h3.js";

export default function () {
  const toggleLogging = (e) => {
    const value = e.target.checked;
    h3.dispatch("settings/set", { logging: value });
    h3.dispatch("app/save");
  };
  return h("div.settings.container", [
    h("h1", "Settings"),
    h("div.options", [
      h("input", {
        type: "checkbox",
        onclick: toggleLogging,
        checked: h3.state.settings.logging,
      }),
      h(
        "label#options-logging-label",
        {
          for: "logging",
        },
        "Logging"
      ),
    ]),
    h(
      "a.nav-link",
      {
        onclick: () => h3.navigateTo("/"),
      },
      "← Go Back"
    ),
  ]);
}
