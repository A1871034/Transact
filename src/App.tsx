import "./styles/App.css";

import { createEffect, createSignal, For } from "solid-js";
import { Router, Route, A, RouteSectionProps} from "@solidjs/router";
import { Component } from "solid-js";

import { Overlay } from "./components/Overlay";
import Home from './pages/Home';
import Accounts from "./pages/Accounts";
import Transfers from './pages/Transfers'
import Transactions from './pages/Transactions';
import Entities from './pages/Entities';
import Settings from "./pages/Settings";

/* Themes */
const [darkMode, setDarkMode] = createSignal(true);
export function toggleTheme() {
  setDarkMode(!darkMode());
}

/* Allows other components to toggle labels 
  TODO: remove in the future after this is not in settings anymore
*/
const [showNavLabels, setShowNavLabels] = createSignal(true);
export function toggleNavLabels() {
  setShowNavLabels(!showNavLabels());
}

/* Main app */
function App() {
  /* Themes reactivity*/
  createEffect(() => {
    document.documentElement.setAttribute("theme-mode", (darkMode()) ? "dark" : "light");
  });

  /* Hack to avoid implemening my own router as all parent urls are "active" eg,
    at "localhost/log", "localhost/" is also active 
    The hack redirects "/" to "/home" without reloading to avoid loops */
  window.history.replaceState(null, "", "/home");

  /* Nav */
  interface navItem {
    "path": string,
    "icon": string,
    "name": string,
    "component": Component<RouteSectionProps<void>> | undefined,
    "class"?: string
  }
  var navItems: {[id:string] : navItem } = {
    "/home": {
      "path": "/home",
      "icon": "/icons/house-solid.svg",
      "name": "Home",
      "component": Home,
    },
    "/transfers": {
      "path": "/transfers",
      "icon": "/icons/arrow-right-arrow-left-solid.svg",
      "name": "Transfers",
      "component": Transfers,
    },
    "/transactions": {
      "path": "/transactions",
      "icon": "/icons/list-ul-solid.svg",
      "name": "Transactions",
      "component": Transactions,
    },
    "/income": {
      "path": "/income",
      "icon": "/icons/coins-solid.svg",
      "name": "Income",
      "component": undefined,
    },
    "/expenses": {
      "path": "/expenses",
      "icon": "/icons/receipt-solid.svg",
      "name": "Expenses",
      "component": undefined,
    },
    "/calculators": {
      "path": "/calculators",
      "icon": "/icons/calculator-solid.svg",
      "name": "Calculators",
      "component": undefined,
    },
    "/accounts": {
      "path": "/accounts",
      "icon": "/icons/credit-card-solid.svg",
      "name": "Accounts",
      "component": Accounts,
    },
    "/entites": {
      "path": "/entites",
      "icon": "/icons/person-shelter-solid.svg",
      "name": "Entites",
      "component": Entities,
    },
    "/jobs": {
      "path": "/jobs",
      "icon": "/icons/briefcase-solid.svg",
      "name": "Jobs",
      "component": undefined,
    },
    "/assets": {
      "path": "/assets",
      "icon": "/icons/warehouse-solid.svg",
      "name": "Assets",
      "component": undefined,
    },
    "/files": {
      "path": "/files",
      "icon": "/icons/folder-solid.svg",
      "name": "Files",
      "component": undefined,
    },
    "/network": {
      "path": "/network",
      "icon": "/icons/circle-nodes-solid.svg",
      "name": "Network",
      "component": undefined,
    },
    "/settings": {
      "path": "/settings",
      "icon": "/icons/gear-solid.svg",
      "name": "Settings",
      "component": Settings,
      "class": "float-bottom"
    },
  }

  /* Banner title */
  const [pageTitle, setPageTitle] = createSignal("Home");
  function updatePageTitle(e: {intent: string, location: {pathname: string}}) {
    if (e.intent !== "navigate") {
      return;
    }
    setPageTitle(navItems[e.location.pathname].name);
  }
  
  /* App */
  const rootApp = (props: any) => (
    <>
      <div class="header">
        <h1>{pageTitle()}</h1>
      </div>
      <div class="container">
        <nav>
          <For each={Object.values(navItems)}>
          {(item, _) => (
            <A class={item.class !== undefined ? item.class : ""} href={item.path} draggable="false"><img src={item.icon} class="icon" draggable="false"/>{showNavLabels() ? (<span>{item.name}</span>) : ""}</A>
          )}
          </For>
        </nav>
        <div class="content">
          {props.children}
        </div>
      </div>
    </>
  )

  return (
    <>
      <Router root={rootApp}>
        <For each={Object.values(navItems)}>
        {(item, _) => (
            <Route path={item.path} component={item.component} preload={updatePageTitle} />
        )}
        </For>
      </Router>
      <Overlay />
    </>
  );
}

export default App;
