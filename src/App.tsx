import ImageComparatorProvider from "./context/ImageComparatorContext";
import ImageComparator from "./components/ImageComparator";

function App() {
  return (
    <div className="w-full h-screen bg-gray-100 font-sans">
      <ImageComparatorProvider>
        <ImageComparator />
      </ImageComparatorProvider>
    </div>
  );
}

export default App;
