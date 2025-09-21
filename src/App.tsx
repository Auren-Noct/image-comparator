import ImageComparatorProvider from "./context/ImageComparatorContext";
import ImageComparator from "./components/ImageComparator";
import ThemeProvider from "./context/ThemeContext";
import Header from "./components/Header";

function App() {
  return (
    <ThemeProvider>
      <ImageComparatorProvider>
        <Header />
        <ImageComparator />
      </ImageComparatorProvider>
    </ThemeProvider>
  );
}

export default App;
