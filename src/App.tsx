import './App.css';
import { userSelector } from './Store/User/User.selector';
import { useSelector } from 'react-redux';

function App() {
  const userStatus = useSelector(userSelector);
  console.log(userStatus.username);
  return (
    <div className="App">
      {userStatus.username}
    </div>
  );
}

export default App;
