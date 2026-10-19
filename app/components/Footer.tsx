import Link from "next/link";

export default function Footer() {
  return (
    <footer className="rx-footer">
      <div className="rx-container">
        <div className="rx-footer-grid">
          <div className="rx-footer-brand">
            <Link href="/" className="rx-footer-logo">
              Rhinox Scientifica
            </Link>

            <p>
              Science. Technology. Creativity.
            </p>
          </div>

          <div className="rx-footer-column">
            <h3>Learn</h3>

            <Link href="/education/stem-steam">
              STEM & STEAM Education
            </Link>

            <Link href="/education/think-move-code">
              Think • Move • Code
            </Link>

            <Link href="/education/books">
              Books
            </Link>

            <Link href="/education/coding-robotics">
              Coding & Robotics
            </Link>
          </div>

          <div className="rx-footer-column">
            <h3>Explore</h3>

            <Link href="/explore/experiments">
              Experiments
            </Link>

            <Link href="/explore/virtual-lab">
              Virtual Labs
            </Link>

            <Link href="/explore/stem-games">
              STEM Games
            </Link>

            <Link href="/explore/stem-challenges">
              STEM Challenges
            </Link>

            <Link href="/explore/project-lab">
              Project Lab
            </Link>
          </div>

          <div className="rx-footer-column">
            <h3>Company</h3>

            <Link href="/about">
              About Rhinox
            </Link>

            <Link href="/schools">
              Schools
            </Link>

            <Link href="/resources">
              Resources
            </Link>

            <Link href="/contact">
              Contact
            </Link>
          </div>
        </div>

        <div className="rx-footer-bottom">
          <p>
            © {new Date().getFullYear()} Rhinox Scientifica. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
