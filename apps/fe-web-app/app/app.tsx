import NxWelcome from './nx-welcome';

export function App() {
  return (
    <div>
      <NxWelcome title="@fe-web-app/fe-web-app" />
      <div>
        This message is used to confirm that the CI workflow is working properly.
      </div>
    </div>
  );
}

export default App;
