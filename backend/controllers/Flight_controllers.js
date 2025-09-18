const { Flight, ClientVisit, cabinClasses, UserInfo } = require("../models/Flight_model");
const PDFDocument = require("pdfkit");

/* -----------Fun for random code----------- */
function generatePromoCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code= "";
  for (let i = 0; i < 8; i++) code+=chars[Math.floor(Math.random()*chars.length)];
  return code;
}



/* -------------------- Flights CRUD -------------------- */
//read All
exports.getAllFlights = async (req, res) => {
  try{
    const{departure,destination, description,date}=req.query;
    const filters={};
    const or=[];

    if(departure) or.push({ departure: { $regex: departure, $options: "i" } });
    if (destination) or.push({ destination: { $regex: destination, $options: "i" } });
    if(description) or.push({ description: { $regex: description, $options: "i" } });
    if(or.length) filters.$or = or;

    // date filter
    if (date){const d = new Date(date);
      if (!isNaN(d)) {const next = new Date(d);
        next.setDate(d.getDate() + 1);
        filters.date = { $gte: d, $lt: next };
      }
    }

    const flights=await Flight.find(filters,"airlineCoverImage departure destination description").sort({ createdAt: 1 });
    res.status(200).json({ flights });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
//read By ID
exports.getFlightById=async (req, res) => {
  try {
    const flight= await Flight.findById(req.params.id);
    if (!flight) return res.status(404).json({ message: "Flight not found", error: "Flight not found" });
    res.status(200).json({ flight });
  } catch (err) { res.status(500).json({ message: "Server error", error: err.message });
  }
};
//create
exports.createFlight = async (req, res) => {
  try {
    let { airlineCoverImage, departure, destination, description, date } = req.body;
    if (!departure || !destination) {
      return res.status(400).json({ message: "Departure and Destination are required", error: "VALIDATION_ERROR" });
    }
    if (date) date = new Date(date);
    const newFlight = new Flight({ airlineCoverImage, departure, destination, description, date });
    await newFlight.save();
    res.status(201).json({ flight: newFlight });
  } catch (err) {
    res.status(400).json({ message: "Invalid flight data", error: err.message });
  }
};
//Update
exports.updateFlight = async (req, res) => {
  try {
    let{airlineCoverImage, departure, destination, description, date}=req.body;
    if(date) date = new Date(date);

    const updateFields={};
    if(airlineCoverImage !== undefined) updateFields.airlineCoverImage = airlineCoverImage;
    if(departure !== undefined) updateFields.departure = departure;
    if(destination !== undefined) updateFields.destination = destination;
    if(description !== undefined) updateFields.description = description;
    if(date !== undefined) updateFields.date = date;

    const flight = await Flight.findByIdAndUpdate(req.params.id, updateFields,{ new:true, runValidators:true });
    if (!flight) return res.status(404).json({ message: "Flight not found",error:"NOT_FOUND" });
    res.status(200).json({ flight });
  } catch (err){res.status(400).json({ message:"Update failed", error:err.message});}
};
//Delete..
exports.deleteFlight = async (req, res) => {
  try{     const flight = await Flight.findByIdAndDelete(req.params.id);
    if (!flight) return res.status(404).json({ message: "Flight not found", error: "NOT_FOUND" });
    res.status(200).json({ message: "Flight deleted" });
  } catch (err) {res.status(500).json({ message: "Delete failed", error: err.message });}
};

/* --------------------cabin __class CRUD -------------------- */
exports.getCabinClasses = (req, res) => {
  res.status(200).json({ cabinClasses });
};

/* -------------Booking&Client visit logic CR ------------- */
exports.bookFlight = async (req, res) => {
  try {
    const{flightId,name,phone,selectedDate,cabinClass,numberOfAdults,locale,currency,tripType,promoOnly,}=req.body;
    if(!flightId || !name){
      return res.status(400).json({message:"Flight and Name are required",error:"VALIDATION_ERROR"});
    }
    const flight=await Flight.findById(flightId);
    if(!flight) return res.status(404).json({ message:"Flight not found",error: "NOT_FOUND" });

    const promoCode = generatePromoCode();
    const visit = new ClientVisit({
      flight: flightId,
      name: String(name).trim(),
      phone: phone ? String(phone).trim() : "",
      selectedDate: selectedDate ? new Date(selectedDate) : undefined,
      promoCode,
      cabinClass,
      numberOfAdults,
      locale,
      currency,
    });await visit.save();
//i
    if (promoOnly) {
      return res.status(200).json({message: "Promo request saved. Our team will send the code via WhatsApp.",promoCode,});
    }

 //get4url
    const fromCode=extractIATACode(flight.departure);
    const toCode= extractIATACode(flight.destination);

    const departDate = selectedDate? new Date(selectedDate).toISOString().slice(0, 10)
    : new Date().toISOString().slice(0, 10);

    let type ="ONEWAY";
    if (typeof tripType === "string"){
      const tt = tripType.toLowerCase();
      if (tt ==="round-trip" || tt ==="roundtrip") type ="ROUNDTRIP";
      else if (tt === "multi-city" || tt === "multicity") type ="MULTICITY";
    }
//cons url
    const base =`https://flights.booking.com/flights/${encodeURIComponent(fromCode)}-${encodeURIComponent(toCode)}`;
    const qs=newURLSearchParams({
      type,
      from: fromCode,
      to: toCode,
      cabinClass: String(cabinClass || "ECONOMY").toUpperCase(),
      sort: "BEST",
      depart: departDate,
      adults: String(numberOfAdults || 1),
      locale: String(locale || "en-us"),
      salesCurrency: String(currency || "USD"),
      customerCurrency: String(currency || "USD"),
    });
    const bookingUrl = `${base}?${qs.toString()}`;

    res.status(201).json({
      message: "Booking recorded",
      bookingLink: bookingUrl,
      promoCode,
    });
  } catch (err) {
    res.status(400).json({ message: "Booking failed", error: err.message });
  }
};

//sav
exports.requestPromo = async (req, res) => {
  try {
    const {
      flightId,
      name,
      phone,
      selectedDate,
      cabinClass,
      numberOfAdults,
      locale,
      currency,
      tripType, // not used here but oneeeeeeeeeeeee
    } = req.body;

    if (!flightId || !name) {
      return res.status(400).json({ message: "Flight and Name are required", error: "VALIDATION_ERROR" });
    }

    const flight = await Flight.findById(flightId);
    if (!flight) return res.status(404).json({ message: "Flight not found", error: "NOT_FOUND" });

    const promoCode = generatePromoCode();

    const visit = new ClientVisit({
      flight: flightId,
      name: String(name).trim(),
      phone: phone ? String(phone).trim() : "",
      selectedDate: selectedDate ? new Date(selectedDate) : undefined,
      promoCode,
      cabinClass,
      numberOfAdults,
      locale,
      currency,
    });
    await visit.save();

    // Display err
    res.status(200).json({
      message: "Promo request received. We'll send the code via WhatsApp shortly.",
      promoCode,
    });
  } catch (err) {
    res.status(400).json({ message: "Promo request failed", error: err.message });
  }
};

/* --------------------promo/Visitsp crud-------------------- */
exports.getAllVisits = async (req, res) => {
  try {const visits = await ClientVisit.find()
      .sort({ bookedAt: -1 })
      .populate("flight","departure destination airlineCoverImage");
    res.status(200).json({ visits });
  } catch (err){res.status(500).json({ message: "Server error", error: err.message });}
};

exports.getVisitStats = async (req, res) => {
  try {
    const count = await ClientVisit.countDocuments();
    res.status(200).json({ totalVisits: count });
  }catch(err) {res.status(500).json({ message: "Server error", error: err.message });}
};

/* --------------------User inf create&read-------------------- */
exports.addUserInfo=async(req,res)=>{
  try{const{name,phone}=req.body;
    if(!name||!phone)
      return res.status(400).json({message:"Name and phone are required",error:"VALIDATION_ERROR"});

    const newUser=new UserInfo({ name:name.trim(),phone:phone.trim(),date:new Date(),});
    await newUser.save();
    res.status(201).json({message:"User info saved",user:newUser });
  } catch (err) {
    res.status(400).json({ message:"Save failed",error:err.message });}
};

exports.getAllUsers=async(req,res)=>{
  try {
    const users =await UserInfo.find().sort({ date: -1 });
    res.status(200).json({users });
  } catch(err){res.status(500).json({message:"Server error", error: err.message });}
};










//========== PDF =================
exports.downloadPromoPDF = async (req, res) => {
  try {
    const visits = await ClientVisit.find()
      .sort({ bookedAt: -1 })
      .populate("flight", "departure destination airlineCoverImage");

    const now = new Date();
    const tsForName = new Intl.DateTimeFormat("en-GB", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
      .format(now)
      .replace(/[/:, ]/g, "_");

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=promo_recipients_${tsForName}.pdf`);

    const doc = new PDFDocument({
      size: "A4",
      margin: 40,
      bufferPages: true,
    });
    doc.pipe(res);

    const brand = {
      primary: "#1d4ed8",
      primaryDark: "#0f2a55",
      zebra: "#f3f7ff",
      border: "#e6e9ef",
      text: "#0b2140",
      muted: "#6b7280",
    };

    doc.info.Title = "Promo Recipients Report";
    doc.info.Subject = "Promo recipients and WhatsApp-ready entries";
    doc.info.Author = "Sri Lanka Tourism Platform";
    doc.info.CreationDate = now;

    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;
    const marginLeft = doc.page.margins.left;
    const marginRight = doc.page.margins.right;
    const contentWidth = pageWidth - marginLeft - marginRight;

    const colSpec = [
      { header: "No.", key: "idx", pct: 0.06, align: "center" },
      { header: "Name", key: "name", pct: 0.22, align: "left" },
      { header: "Phone", key: "phone", pct: 0.14, align: "left" },
      { header: "From", key: "from", pct: 0.14, align: "left" },
      { header: "To", key: "to", pct: 0.14, align: "left" },
      { header: "Date", key: "date", pct: 0.12, align: "left" },
      { header: "Promo", key: "promo", pct: 0.18, align: "left" },
    ].map((c) => ({ ...c, width: Math.floor(contentWidth * c.pct) }));

    function drawReportHeader() {
      const bandH = 64;
      doc.save();
      doc.rect(0, 0, pageWidth, bandH).fill(brand.primary);
      doc.fill("#ffffff").fontSize(18).font("Helvetica-Bold");
      doc.text("Promo Recipients Report", marginLeft, 18, { width: contentWidth, align: "left" });
      doc.fontSize(10).font("Helvetica");
      doc.text(`Generated: ${now.toLocaleString()}`, marginLeft, 40, { width: contentWidth, align: "left" });
      doc.restore();

      const sumY = 64 + 14;
      doc.roundedRect(marginLeft, sumY, contentWidth, 44, 8).fillAndStroke("#ffffff", brand.border);
      doc.fill(brand.text);
      doc.font("Helvetica-Bold").fontSize(12).text("Summary", marginLeft + 12, sumY + 8);
      doc.font("Helvetica").fontSize(10).fillColor(brand.muted);
      const readyToSend = visits.filter((v) => v.phone && v.promoCode).length;
      doc.text(`Total: ${visits.length}   •   Ready to Send: ${readyToSend}`, marginLeft + 12, sumY + 25);
      doc.moveDown();
      doc.y = sumY + 44 + 14;
    }

    function drawTableHeader(y) {
      const headerH = 24;
      doc.save();
      doc.rect(marginLeft, y, contentWidth, headerH).fill(brand.primaryDark);
      doc.fill("#ffffff").font("Helvetica-Bold").fontSize(11);

      let x = marginLeft;
      colSpec.forEach((c) => {
        doc.text(c.header, x + 6, y + 6, {
          width: c.width - 12,
          align: c.align === "center" ? "center" : "left",
          ellipsis: true,
        });
        x += c.width;
      });

      doc.restore();
      return y + headerH;
    }

    function drawRow(row, y, isZebra) {
      const paddingX = 6;
      const paddingY = 6;
      doc.save();

      doc.font("Helvetica").fontSize(10);
      let x = marginLeft;
      const heights = colSpec.map((c) => {
        const text = String(row[c.key] ?? "-");
        return doc.heightOfString(text, {
          width: c.width - 2 * paddingX,
          align: c.align === "center" ? "center" : "left",
        });
      });
      const rowH = Math.max(18, Math.max(...heights) + 2 * paddingY);

      if (isZebra) {
        doc.rect(marginLeft, y, contentWidth, rowH).fill(brand.zebra);
        doc.fillColor(brand.text);
      }

      x = marginLeft;
      colSpec.forEach((c) => {
        const text = String(row[c.key] ?? "-");
        doc.fillColor(brand.text);
        doc.text(text, x + paddingX, y + paddingY, {
          width: c.width - 2 * paddingX,
          align: c.align === "center" ? "center" : "left",
        });
        x += c.width;
      });

      doc.strokeColor(brand.border).lineWidth(0.5);
      doc.moveTo(marginLeft, y + rowH).lineTo(marginLeft + contentWidth, y + rowH).stroke();

      doc.restore();
      return rowH;
    }

    drawReportHeader();
    let y = drawTableHeader(doc.y);

    const rows = visits.map((v, i) => ({
      idx: i + 1,
      name: v.name || "-",
      phone: v.phone || "-",
      from: v.flight?.departure || "-",
      to: v.flight?.destination || "-",
      date: v.bookedAt ? new Date(v.bookedAt).toISOString().slice(0, 10) : "-",
      promo: v.promoCode || "-",
    }));

    const bottomLimit = pageHeight - doc.page.margins.bottom - 46;

    rows.forEach((row, i) => {
      doc.font("Helvetica").fontSize(10);
      const paddingX = 6;
      const paddingY = 6;
      const heights = colSpec.map((c) =>
        doc.heightOfString(String(row[c.key] ?? "-"), { width: c.width - 2 * paddingX })
      );
      const rowH = Math.max(18, Math.max(...heights) + 2 * paddingY);

      if (y + rowH > bottomLimit) {
        doc.addPage();
        drawReportHeader();
        y = drawTableHeader(doc.y);
      }

      const paintedH = drawRow(row, y, i % 2 === 1);
      y += paintedH;
    });

    // Footer with page numbers
    const range = doc.bufferedPageRange();
    for (let i = 0; i < range.count; i++) {
      doc.switchToPage(range.start + i);
      doc.strokeColor(brand.border).lineWidth(1);
      doc.moveTo(marginLeft, pageHeight - 40).lineTo(pageWidth - marginRight, pageHeight - 40).stroke();
      doc.fillColor(brand.muted).font("Helvetica").fontSize(9).text(
        `Page ${i + 1} of ${range.count}`,
        marginLeft,
        pageHeight - 34,
        { width: contentWidth, align: "center" }
      );
      doc.text("Sri Lanka Tourism Platform • Generated report", marginLeft, pageHeight - 34, {
        width: contentWidth,
        align: "left",
      });
    }
    doc.flushPages();

    doc.end();
  } catch (err) {
    console.error("PDF generation failed:", err);
    res.status(500).json({ message: "PDF generation failed", error: err.message });
  }
};

//===========================
// trim fun 
function extractIATACode(str = "") {
  const m = String(str).match(/\(([A-Z0-9]{2,4})\)/);
  if (m && m[1]) return m[1].toUpperCase();
  return String(str).trim();
}

