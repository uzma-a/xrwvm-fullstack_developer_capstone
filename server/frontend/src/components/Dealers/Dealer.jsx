import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import "./Dealers.css";
import "../assets/style.css";

import positive_icon from "../assets/positive.png";
import neutral_icon from "../assets/neutral.png";
import negative_icon from "../assets/negative.png";
import review_icon from "../assets/reviewbutton.png";

import Header from '../Header/Header';


const Dealer = () => {

  const { id } = useParams();

  const [dealer, setDealer] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [unreviewed, setUnreviewed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [postReview, setPostReview] = useState(null);


  // Get root URL
  const curr_url = window.location.href;
  const root_url = curr_url.substring(0, curr_url.indexOf("dealer"));


  // API URLs
  const dealer_url = root_url + `djangoapp/dealer/${id}`;
  const reviews_url = root_url + `djangoapp/reviews/dealer/${id}`;
  const post_review = root_url + `postreview/${id}`;


  // =========================
  // GET DEALER
  // =========================

  const get_dealer = async () => {

    try {

      console.log("Fetching dealer:", dealer_url);

      const res = await fetch(dealer_url);

      const retobj = await res.json();

      console.log("Dealer API response:", retobj);

      if (!res.ok) {
        console.error("Dealer API error:", res.status);
        return;
      }


      /*
       * Django may return:
       *
       * {
       *   status: 200,
       *   dealer: [...]
       * }
       *
       * OR directly:
       *
       * {
       *   id: 1,
       *   full_name: "...",
       *   ...
       * }
       */

      let dealerData = null;


      if (Array.isArray(retobj.dealer)) {

        dealerData = retobj.dealer[0];

      } else if (retobj.dealer) {

        dealerData = retobj.dealer;

      } else if (retobj.full_name) {

        dealerData = retobj;

      }


      console.log("Dealer data:", dealerData);


      if (dealerData) {
        setDealer(dealerData);
      } else {
        console.error("Dealer data not found in API response");
      }

    } catch (error) {

      console.error("Error fetching dealer:", error);

    } finally {

      setLoading(false);

    }
  };


  // =========================
  // GET REVIEWS
  // =========================

  const get_reviews = async () => {

    try {

      console.log("Fetching reviews:", reviews_url);

      const res = await fetch(reviews_url);

      const retobj = await res.json();

      console.log("Reviews API response:", retobj);


      if (res.ok) {

        if (retobj.reviews && retobj.reviews.length > 0) {

          setReviews(retobj.reviews);

        } else {

          setUnreviewed(true);

        }

      } else {

        setUnreviewed(true);

      }

    } catch (error) {

      console.error("Error fetching reviews:", error);

      setUnreviewed(true);

    }
  };


  // =========================
  // SENTIMENT ICON
  // =========================

  const senti_icon = (sentiment) => {

    if (sentiment === "positive") {
      return positive_icon;
    }

    if (sentiment === "negative") {
      return negative_icon;
    }

    return neutral_icon;
  };


  // =========================
  // PAGE LOAD
  // =========================

  useEffect(() => {

    get_dealer();

    get_reviews();


    // Show Post Review button if logged in
    if (sessionStorage.getItem("username")) {

      setPostReview(
        <a href={post_review}>
          <img
            src={review_icon}
            style={{
              width: "10%",
              marginLeft: "10px",
              marginTop: "10px"
            }}
            alt="Post Review"
          />
        </a>
      );

    }

  }, [id]);


  // =========================
  // LOADING DEALER
  // =========================

  if (loading) {

    return (
      <div style={{ margin: "20px" }}>
        <Header />

        <h2 style={{ color: "grey" }}>
          Loading dealer...
        </h2>
      </div>
    );

  }


  // =========================
  // DEALER NOT FOUND
  // =========================

  if (!dealer) {

    return (
      <div style={{ margin: "20px" }}>
        <Header />

        <h2 style={{ color: "red" }}>
          Dealer information could not be loaded.
        </h2>

        <p>
          Dealer ID: {id}
        </p>
      </div>
    );

  }


  // =========================
  // MAIN PAGE
  // =========================

  return (

    <div style={{ margin: "20px" }}>

      <Header />


      <div style={{ marginTop: "10px" }}>

        <h1 style={{ color: "grey" }}>
          {dealer.full_name}
          {postReview}
        </h1>


        <h4 style={{ color: "grey" }}>
          {dealer.city}, {dealer.address}, Zip - {dealer.zip}, {dealer.state}
        </h4>

      </div>


      {/* REVIEWS */}

      <div className="reviews_panel">

        {reviews.length === 0 && !unreviewed ? (

          <div>
            Loading Reviews....
          </div>

        ) : unreviewed ? (

          <div>
            No reviews yet!
          </div>

        ) : (

          reviews.map((review, index) => (

            <div
              className="review_panel"
              key={index}
            >

              <img
                src={senti_icon(review.sentiment)}
                className="emotion_icon"
                alt="Sentiment"
              />


              <div className="review">
                {review.review}
              </div>


              <div className="reviewer">
                {review.name}{" "}
                {review.car_make}{" "}
                {review.car_model}{" "}
                {review.car_year}
              </div>

            </div>

          ))

        )}

      </div>

    </div>

  );

};


export default Dealer;