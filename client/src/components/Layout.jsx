import Navbar from "./Navbar";

const Layout = ({ children }) => (
  <>
    <Navbar />
    <main className="container">{children}</main>
  </>
);

export default Layout;
