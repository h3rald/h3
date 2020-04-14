import h3 from "../h3.js";

export default function () {
  const toggleLogging = () => {
    const value = document.getElementById("options-logging").checked;
    h3.dispatch("settings/set", { logging: value });
    h3.dispatch("app/save");
  };
  const attrs = {
    type: "checkbox",
    onclick: toggleLogging,
  };
  if (h3.state.settings.logging) {
    attrs.checked = true;
  }
  return h3("div.settings.container", [
    h3("h1", "Settings"),
    h3("div.options", [
      h3("input#options-logging", attrs),
      h3(
        "label#options-logging-label",
        {
          for: "logging",
        },
        "Logging"
      ),
    ]),
    h3(
      "a.nav-link",
      {
        onclick: () => h3.navigateTo("/"),
      },
      "← Go Back"
    )
  ]);
}
