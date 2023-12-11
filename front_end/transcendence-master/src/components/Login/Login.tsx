function Login() {
    async function auth() {
      try {
        window.location.href = 'http://127.0.0.1:3003/auth/42';
      } catch (error) {
        alert("teeeessstt")
        window.location.replace("http://localhost:5173/")
      }
    }
  
    return (
        <div className="min-h-screen w-screen flex items-center justify-center bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700">
        <div className="bg-white p-8 rounded-lg shadow-md w-96">
          <h1 className="text-2xl font-semibold text-gray-800 mb-4 text-center">Welcome to Ping Pong Game</h1>
          <button
            className="block w-full bg-purple-700 hover:bg-purple-800 text-white font-semibold py-2 px-4 rounded-full focus:outline-none focus:ring focus:ring-purple-400"
            type="button"
            onClick={() => auth()}
          >
            Login with Intra
          </button>
        </div>
      </div>
      
    );
  }
  
  export default Login;
