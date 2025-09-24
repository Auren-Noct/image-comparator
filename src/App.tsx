import ImageComparatorProvider from "./context/ImageComparatorContext";
import ImageComparator from "./components/ImageComparator";
import ThemeProvider from "./context/ThemeContext";
import { NotificationProvider } from "./context/NotificationContext";
import Header from "./components/Header";

function App() {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <ImageComparatorProvider>
          <Header />
          <ImageComparator />
        </ImageComparatorProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
}

export default App;
