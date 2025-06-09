import aadharPic from './assets/aadhar.jpg'
import './App.css'

function App() {
  return (
    <>
      <p>EMAIL: test.user@example.com</p>
      <p>PHONE: +91 98765 43210</p>
      <p>AADHAR: 1234 5678 9012</p>
      <p>PAN: ABCDE1234F</p>
      <p>PASSPORT: A-1234567</p>
      <img src={aadharPic} />
    </>
  )
}

export default App
