import { Button } from "../components/ui/button";

export default function Nav() {
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="flex justify-between items-center bg-gradient-to-r from-amber-600 to-amber-800 p-4 shadow-lg sticky top-0 z-50">
      <div className="flex items-center space-x-2">
        <span className="text-3xl">📄</span>
        <h1 className="text-2xl font-bold text-white tracking-wide">
          Resume-Mania
        </h1>
      </div>

      <nav className="hidden md:flex space-x-4">
        <Button
          onClick={() => scrollToSection('upload')}
          className="bg-white text-amber-800 hover:bg-amber-100 font-semibold transition"
        >
          Upload
        </Button>
        <Button
          onClick={() => scrollToSection('results')}
          className="bg-white text-amber-800 hover:bg-amber-100 font-semibold transition"
        >
          Results
        </Button>
        <Button
          onClick={() => scrollToSection('suggestions')}
          className="bg-white text-amber-800 hover:bg-amber-100 font-semibold transition"
        >
          Tips
        </Button>
      </nav>

      <div className="flex items-center space-x-2">
        <span className="text-white text-sm hidden lg:block">
          Check your ATS score now!
        </span>
        <Button className="bg-green-500 hover:bg-green-600 text-white font-bold transition">
          Get Started
        </Button>
      </div>
    </div>
  );
}
