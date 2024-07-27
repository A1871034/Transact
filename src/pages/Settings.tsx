import { toggleTheme, toggleNavLabels } from '../App'

function Settings() {
    return (
        <>
            <button onClick={toggleTheme}>Toggle Theme</button>
            <button onClick={toggleNavLabels}>Collapse</button>
        </>
    )
}

export default Settings;