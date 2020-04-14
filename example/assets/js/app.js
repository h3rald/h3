import h3 from "./h3.js";
import modules from "./modules.js";
import SettingsView from "./components/SettingsView.js";
import MainView from "./components/MainView.js";

h3.init({
  element: document.getElementById("app"),
  modules,
  onInit: () => {
    h3.dispatch("app/load");
    h3.dispatch("settings/set", h3.state.settings);
  },
  routes: {
    "/settings": SettingsView,
    "/": MainView,
  },
});
