import { PageHeading } from "@/components/layout/page-heading";
export const metadata = { title: "About" };
const heading =
  "mb-5 mt-6 rounded-sm border-l-[5px] border-primary bg-card px-7 py-2 text-lg font-extralight text-card-foreground";
const link = "text-link underline underline-offset-2 break-words";
export default function AboutPage() {
  return (
    <>
      <PageHeading>About</PageHeading>
      <h2 className={heading}>Energy Meter Analysis and Reporting Technology (EMART)</h2>
      <p className="leading-relaxed">
        <b>Copyright © 2018 EMART Technology</b>
        <br />
        <br />
        <b>EMART</b> is a device specially programmed to address such concerns which are currently
        experienced by consumers.
        <br />
        It is a device capable of reading the energy consumption;
        <br />
        provide a monthly bill estimator to estimate current energy consumption and set their target
        maximum bill for the month.
        <br />
        In this manner, the inconvenience of not keeping track of the energy consumption can be
        addressed.
      </p>
      <h2 className={heading}>Developers</h2>
      <p>
        <a
          className={link}
          href="https://www.facebook.com/FriXx21"
          target="_blank"
          rel="noopener noreferrer"
        >
          Dickson Palomeras
        </a>
      </p>
      <h2 className={heading}>Credits</h2>
      <p className="leading-relaxed">
        <a className={link} href="https://github.com/ThisIsDallas/Simple-Grid">
          SIMPLE GRID
        </a>{" "}
        - © ZACH COLE 2016
        <br />
        <br />
        The MAC address vendor list is based on the Wireshark manufacturer database.
        <br />
        Source:{" "}
        <a className={link} href="https://www.wireshark.org/tools/oui-lookup.html">
          https://www.wireshark.org/tools/oui-lookup.html
        </a>
        <br />
        Wireshark is released under the GNU General Public License version 2
      </p>
      <p className="mt-6 leading-relaxed">
        <a className={link} href="https://www.saveonenergy.com/energy-consumption/">
          SaveOnEnergy
        </a>{" "}
        - © Copyright 2019 SaveOnEnergy.com
        <br />
        <br />
        SaveOnEnergy.com, the SaveOnEnergy.com logo, and &quot;May the best rate win&quot; are
        registered trademarks and/or service marks of Save On Energy, LLC.
        <br />
        Source:{" "}
        <a className={link} href="https://www.saveonenergy.com/energy-consumption/">
          https://www.saveonenergy.com/energy-consumption/
        </a>
      </p>
    </>
  );
}
