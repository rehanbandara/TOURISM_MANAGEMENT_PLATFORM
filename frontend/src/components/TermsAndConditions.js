import React, { useState } from "react";
import "./TermsAndConditions.css";

const termsData = [
  {
    title: "Use of the Platform",
    content:
      "You agree to use this platform only for lawful purposes. Misuse of services or unauthorized access is prohibited.",
  },
  {
    title: "Account Responsibilities",
    content:
      "Users must provide accurate information when registering. You are responsible for maintaining the confidentiality of your account credentials.",
  },
  {
    title: "Booking and Payments",
    content:
      "All bookings are subject to availability and platform policies. Payments must be made in accordance with platform instructions.",
  },
  {
    title: "Cancellation and Refunds",
    content:
      "Cancellation policies depend on the service provider. Refunds are processed according to the provider's rules.",
  },
  {
    title: "Intellectual Property",
    content:
      "All content, including text, graphics, logos, and images, is owned by the platform and protected by copyright laws.",
  },
  {
    title: "Liability",
    content:
      "We are not liable for any indirect or consequential losses arising from the use of our platform.",
  },
  {
    title: "Privacy",
    content:
      "By using this platform, you consent to our collection and use of your data as described in our Privacy Policy.",
  },
  {
    title: "Changes to Terms",
    content:
      "We may update these terms from time to time. It is your responsibility to review them regularly.",
  },
];

const TermsAndConditions = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="terms-wrapper">
      <h1>Terms and Conditions</h1>
      <div className="accordion">
        {termsData.map((item, index) => (
          <div
            className={`accordion-item ${
              activeIndex === index ? "active" : ""
            }`}
            key={index}
          >
            <div
              className="accordion-title"
              onClick={() => toggleAccordion(index)}
            >
              <h2>{item.title}</h2>
              <span>{activeIndex === index ? "-" : "+"}</span>
            </div>
            <div className="accordion-content">
              <p>{item.content}</p>
            </div>
          </div>
        ))}
      </div>
      <p className="contact">
        Questions? Contact us at <strong>support@touristplatform.com</strong>
      </p>
    </div>
  );
};

export default TermsAndConditions;
