import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import aboutHotel from "../assets/aboutus.jpg.jpeg";

function About() {
  return (
    <>
      <Helmet>
        <title>About Us | Lunara Stay</title>
        <meta
          name="description"
          content="Learn more about Lunara Stay and our simple hotel discovery experience."
        />
      </Helmet>

      <div className="about-page">

        <header className="navbar">

          <Link to="/" className="logo">
            ✦ LUNARA STAY
          </Link>

          <nav>

            <Link to="/">
              Home
            </Link>

            <Link to="/about">
              About Us
            </Link>

            <Link to="/explore-stays">
              Explore Stays
            </Link>

            <Link to="/add-hotel">
              Add Hotel
            </Link>

          </nav>

        </header>

        <main>

          <section
            className="about-hero"
            style={{
              backgroundImage: `
                linear-gradient(
                  rgba(25, 32, 28, 0.68),
                  rgba(25, 32, 28, 0.68)
                ),
                url(${aboutHotel})
              `,
            }}
          >

            <div className="about-hero-content">

              <span className="about-sparkle">
                ✦
              </span>

              <h1>
                About Lunara Stay
              </h1>

              <p>
                A thoughtfully designed stay experience
                for journeys worth remembering.
              </p>

            </div>

          </section>

          <section className="about-story">

            <div className="about-section-content">

              <span className="about-label">
                OUR STORY
              </span>

              <h2>
                Stays made for meaningful journeys
              </h2>

              <p>
                Lunara Stay is a hotel discovery platform
                created to make finding comfortable and
                memorable stays simple.
              </p>

              <p>
                From peaceful getaways to city stays,
                Lunara Stay brings different accommodation
                options together in one easy-to-use place.
              </p>

            </div>

          </section>

          <section className="about-offer">

            <div className="about-section-heading">

              <span className="about-label">
                WHAT WE OFFER
              </span>

              <h2>
                Everything you need to find your stay
              </h2>

            </div>

            <div className="offer-list">

              <div className="offer-card">

                <div className="offer-icon">
                  ⌕
                </div>

                <h3>
                  Easy Discovery
                </h3>

                <p>
                  Search hotels and locations easily
                  to find a stay that fits your journey.
                </p>

              </div>

              <div className="offer-card">

                <div className="offer-icon">
                  ✦
                </div>

                <h3>
                  Quality Stays
                </h3>

                <p>
                  Explore comfortable hotels with useful
                  information before making your choice.
                </p>

              </div>

              <div className="offer-card">

                <div className="offer-icon">
                  ✓
                </div>

                <h3>
                  Simple Experience
                </h3>

                <p>
                  A clean and simple interface designed
                  to make hotel discovery effortless.
                </p>

              </div>

            </div>

          </section>

          <section className="why-section">

            <div className="why-content">

              <span className="about-label">
                WHY LUNARA STAY
              </span>

              <h2>
                Your journey deserves a beautiful beginning.
              </h2>

              <p>
                We believe choosing a place to stay should
                feel as enjoyable as the journey itself.
                Lunara Stay brings simplicity, comfort and
                thoughtful design together to help you
                discover your next stay.
              </p>

              <Link
                to="/"
                className="about-home-btn"
              >
                Explore Our Stays
              </Link>

            </div>

          </section>

        </main>

        <footer className="footer">

          <p>
            © 2026 Lunara Stay. All rights reserved.
          </p>

        </footer>

      </div>
    </>
  );
}

export default About;

