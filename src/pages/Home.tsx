import { createSignal } from "solid-js";
import { invoke } from "@tauri-apps/api/tauri";

const [greetMsg, setGreetMsg] = createSignal("");
const [name, setName] = createSignal("");

async function greet() {
    // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
    setGreetMsg(await invoke("greet", { name: name() }));
}

function Home() {
    return (
        <div class="page_content">
            <p>Home page will go here</p>

            <form
            class="row"
            onSubmit={(e) => {
                e.preventDefault();
                greet();
            }}
            >
            <input
                id="greet-input"
                onChange={(e) => setName(e.currentTarget.value)}
                placeholder="Enter your name..."
            />
            <button type="submit">Greet</button>
            </form>

            <p>{greetMsg()}</p>
        </div>
    )
}

export default Home;