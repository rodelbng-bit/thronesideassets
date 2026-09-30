import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

// Social-share preview card (LinkedIn, WhatsApp, X, etc.) for every page.
export const alt = "Throneside Assets — Vetted UK property deals, delivered every week";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Matches the --ink / --paper / --brass tokens in globals.css.
const INK = "#12100e";
const PAPER = "#f2ede2";
const PAPER_DIM = "#d9d0bd";
const BRASS_BRIGHT = "#d9a862";

export default async function Image() {
  const logo = await readFile(join(process.cwd(), "public/logo-mark.png"));
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: INK,
          color: PAPER,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoSrc} width={64} height={63} alt="" />
          <div style={{ fontSize: 36 }}>Throneside Assets</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 22, letterSpacing: 4, color: BRASS_BRIGHT }}>
            WEEKLY DEAL SHEET
          </div>
          <div
            style={{
              marginTop: 20,
              fontSize: 72,
              lineHeight: 1.05,
              letterSpacing: -1,
              maxWidth: 950,
            }}
          >
            Vetted property deals, delivered every week.
          </div>
        </div>

        <div style={{ fontSize: 26, color: PAPER_DIM }}>
          thronesideassets.com
        </div>
      </div>
    ),
    size
  );
}
