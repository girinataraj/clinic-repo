import { Link } from 'react-router';
import { ShieldCheck, ArrowLeft, Phone, Mail, MapPin } from 'lucide-react';

/**
 * Public, unauthenticated Privacy Policy page (/privacy-policy).
 *
 * Suitable for use as the Google Play Console "Privacy Policy URL". It is
 * deliberately registered outside the authenticated route group so it renders
 * without a session, and it makes no API calls — the content is static.
 *
 * Every statement here is grounded in what the application actually does. Do
 * not add claims (analytics, advertising, location, regulatory certification,
 * self-service deletion, etc.) unless the code genuinely supports them.
 */

const EFFECTIVE_DATE = '2 September 2026';

const CLINIC = {
  name: 'SAAI Physiotherapy Clinic',
  address: '20A/10, Sakthi Nagar, Sengodapalayam, Thindal, Erode Dt - 638012, Tamil Nadu, India',
  phone: '94864 05778',
  email: 'saaiphysioclinicerode@gmail.com',
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-5 sm:p-6">
      <h2 className="text-[16px] sm:text-[17px] font-bold text-slate-900 dark:text-white mb-3">{title}</h2>
      <div className="flex flex-col gap-3 text-[13.5px] sm:text-[14px] leading-relaxed text-slate-700 dark:text-slate-300">
        {children}
      </div>
    </section>
  );
}

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-col gap-2 pl-1">
      {items.map((item) => (
        <li key={item} className="flex gap-2.5">
          <span aria-hidden="true" className="mt-[7px] w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400 shrink-0" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans">
      {/* Header */}
      <header className="bg-gradient-to-br from-[#262842] to-[#3B3E66] dark:from-slate-900 dark:to-slate-800 rounded-b-3xl shadow-lg">
        <div className="max-w-4xl mx-auto px-5 sm:px-8 pt-safe-top-6 pb-8 sm:pb-10">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-[13px] font-semibold text-white/80 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft size={16} />
            Back to Sign In
          </Link>
          <div className="flex items-start gap-4">
            <div className="hidden sm:flex items-center justify-center w-14 h-14 rounded-2xl bg-white/10 border border-white/20 shrink-0">
              <ShieldCheck size={26} className="text-white" />
            </div>
            <div>
              <h1 className="text-[26px] sm:text-[32px] font-bold text-white tracking-tight leading-tight">
                Privacy Policy
              </h1>
              <p className="text-[14px] text-white/80 mt-1.5">{CLINIC.name}</p>
              <p className="text-[12.5px] text-white/60 mt-2">Effective date: {EFFECTIVE_DATE}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-5 sm:px-8 py-8 sm:py-10 flex flex-col gap-4 sm:gap-5">
        <Section title="1. About this policy">
          <p>
            This policy explains how {CLINIC.name} ("we", "us", "the clinic") collects, uses, stores and
            shares information in the SAAI Physiotherapy application and its web version (together, "the
            app"). The app is a private clinic-management tool used by our physiotherapy staff to record
            patient assessments and treatment, and by patients to view their own records and appointments.
          </p>
          <p>
            The app is operated by {CLINIC.name} from Erode, Tamil Nadu, India. It is not a general-purpose
            consumer service and is not open to public self-registration: accounts are created by clinic
            staff for our own patients and employees.
          </p>
        </Section>

        <Section title="2. Information we collect">
          <p className="font-semibold text-slate-900 dark:text-white">Account and login information</p>
          <Bullets
            items={[
              'Name, email address and assigned role (doctor, therapist, patient or administrator).',
              'A securely hashed version of your password. We never store your password in readable form.',
              'Session information used to keep you signed in, including sign-in tokens stored on your own device.',
            ]}
          />

          <p className="font-semibold text-slate-900 dark:text-white mt-2">Patient identification and contact details</p>
          <Bullets
            items={[
              'Name, age, date of birth, gender, phone number, email address and city or town.',
              'A clinic patient identifier and, where used, a physical file number.',
              'The therapist assigned to you and your current visit status within the clinic.',
            ]}
          />

          <p className="font-semibold text-slate-900 dark:text-white mt-2">Health and clinical information</p>
          <Bullets
            items={[
              'Vital signs recorded during a visit, such as blood pressure, pulse rate, oxygen saturation, temperature and ejection fraction.',
              'Presenting complaints, associated symptoms, reported pain level and relevant medical history.',
              'Physiotherapy assessment findings, including physical examination notes, range of motion and muscle power measurements, anthropometric measurements, and neurological or cardio-respiratory assessment findings where those assessments are performed.',
              'Diagnosis, clinical management notes and the prescribed treatment plan.',
              'Prescribed exercise programmes, including exercise names, sets, repetitions, duration and instructions.',
              'Appointment dates, times, status, reason for the visit and related notes.',
            ]}
          />

          <p className="font-semibold text-slate-900 dark:text-white mt-2">Documents and reports</p>
          <Bullets
            items={[
              'Documents uploaded to a patient record by clinic staff, such as scans, X-ray or laboratory reports, including the file name, type and size.',
              'Assessment reports and payment invoices generated by the app as PDF documents.',
            ]}
          />

          <p className="font-semibold text-slate-900 dark:text-white mt-2">Billing information</p>
          <Bullets
            items={[
              'The amount charged for a visit, the visit type, and the payment method recorded by staff (for example cash or UPI).',
              'The standard charges for the physiotherapy treatments provided.',
            ]}
          />
          <p className="text-slate-600 dark:text-slate-400">
            We do not collect or store card numbers, bank account details or UPI credentials. The app records
            only that a payment was taken and by which method; payments themselves are handled at the clinic
            and are not processed through the app.
          </p>

          <p className="font-semibold text-slate-900 dark:text-white mt-2">Technical and security information</p>
          <Bullets
            items={[
              'IP address, browser or device user-agent string, and the date and time of sign-in and other significant actions, recorded in our security audit log.',
              'A record of which staff account created or changed a clinical record, so that entries in a patient file remain traceable.',
            ]}
          />
        </Section>

        <Section title="3. What we do not collect">
          <p>To be explicit, the app does not collect or use any of the following:</p>
          <Bullets
            items={[
              'Location or GPS data.',
              'Camera, photo library, microphone or audio data.',
              'Your contacts, calendar or messages.',
              'Advertising identifiers. We do not show advertising and we do not track you across other apps or websites.',
              'Third-party analytics, behavioural profiling or crash-reporting services.',
              'Biometric identifiers.',
            ]}
          />
        </Section>

        <Section title="4. How we use your information">
          <Bullets
            items={[
              'To provide physiotherapy care: recording assessments, forming a diagnosis, planning and delivering treatment, and tracking progress across visits.',
              'To manage appointments and the daily clinic schedule.',
              'To produce assessment reports and payment invoices for your visit.',
              'To let you sign in securely and to show you the records you are entitled to see.',
              'To keep clinic billing and visit records for clinic administration.',
              'To protect the security and integrity of the system, investigate suspected misuse, and maintain an audit trail of who accessed or changed clinical records.',
            ]}
          />
          <p>
            We do not use your information for advertising, for automated decision-making about your care, or
            for any purpose unrelated to your treatment and our clinic administration.
          </p>
        </Section>

        <Section title="5. Who can see your information">
          <Bullets
            items={[
              'Patients can see only their own records, appointments, prescribed exercises and documents.',
              'Therapists, doctors and administrators at the clinic can access patient records in order to provide and manage care. Access is controlled by the role assigned to each staff account.',
              'We do not sell your information, and we do not share it with advertisers or data brokers.',
            ]}
          />
          <p>
            We may disclose information where we are required to do so by law, by a court, or by a competent
            authority, or where disclosure is necessary to protect the safety of a patient or another person.
          </p>
        </Section>

        <Section title="6. Service providers">
          <p>
            We use the following third-party infrastructure providers to run the app. They process data only
            to host our systems on our instructions, and not for their own purposes:
          </p>
          <Bullets
            items={[
              'DigitalOcean — cloud server hosting, managed PostgreSQL database hosting, and Spaces object storage for uploaded patient documents.',
            ]}
          />
          <p>
            We do not integrate any advertising network, analytics provider, or social media platform into the
            app.
          </p>
        </Section>

        <Section title="7. How your information is stored and protected">
          <Bullets
            items={[
              'All traffic between the app and our servers is encrypted in transit using HTTPS.',
              'Passwords are stored only as salted cryptographic hashes and cannot be read by staff.',
              'Access is role-based: each account can reach only the records appropriate to its role, and patient accounts are restricted to their own record.',
              'Sign-in sessions use short-lived access tokens together with refresh tokens that are stored in hashed form and can be revoked.',
              'Uploaded documents are held in private object storage that is not publicly listable, and are served only through short-lived, single-file download links.',
              'Significant actions, including sign-in and changes to clinical records, are written to an audit log.',
            ]}
          />
          <p>
            No system can be guaranteed to be completely secure. We work to protect your information, but we
            cannot promise that unauthorised access will never occur.
          </p>
        </Section>

        <Section title="8. Data retention">
          <p>
            We keep patient records, including assessments, treatment plans, appointments, uploaded documents
            and billing entries, for as long as you remain a patient of the clinic and afterwards for as long
            as we need them for legitimate clinical, administrative and legal purposes — for example, to
            support continuity of care if you return for treatment, and to maintain accurate clinic records.
          </p>
          <p>
            Security audit entries and sign-in session records are kept for a limited period for security
            purposes. Expired or revoked sign-in tokens cease to be usable.
          </p>
        </Section>

        <Section title="9. Deleting your data">
          <p>
            The app does not currently provide a self-service "delete my account" button. Deletion is handled
            by clinic staff on request.
          </p>
          <p>
            To request deletion of your account or your patient record, contact us using the details in the
            "Contact us" section below. Please tell us your name and registered phone number so we can
            identify your record. We will verify your identity before acting on any deletion request.
          </p>
          <p>
            When a patient record is deleted by clinic staff, the associated assessments, appointments,
            uploaded documents, prescribed exercise plans, reports and billing entries for that record are
            deleted along with it. Individual uploaded documents can also be deleted separately on request.
          </p>
          <p>
            We may need to retain limited information where we are required or permitted to do so by law, or
            where it is necessary for the establishment or defence of a legal claim.
          </p>
        </Section>

        <Section title="10. Your choices and rights">
          <p>
            You may ask us to confirm what information we hold about you, to correct information that is
            inaccurate or out of date, or to delete your record as described above. To make any of these
            requests, contact us using the details below. We may need to verify your identity first.
          </p>
          <p>
            If you have a concern about how your information has been handled, please raise it with us
            directly using the same contact details and we will look into it.
          </p>
        </Section>

        <Section title="11. Children and minors">
          <p>
            The clinic treats patients of all ages, including children, as part of its paediatric
            physiotherapy service. The app is not directed at children for self-registration, and children do
            not create their own accounts.
          </p>
          <p>
            Where a patient is a minor, the record is created and maintained by clinic staff, and the parent
            or legal guardian is responsible for providing the information and for consenting to treatment. A
            parent or guardian may contact us to access, correct or request deletion of a minor's record.
          </p>
        </Section>

        <Section title="12. Information stored on your device">
          <p>
            The app stores your sign-in session on your own device so that you do not have to sign in again
            each time you open it. Signing out removes it.
          </p>
          <p>
            When you choose to download an assessment report or an invoice, the resulting PDF is saved to your
            own device, in the Documents folder on Android or through your browser's normal download
            behaviour on the web. Once saved, that file is under your control, and you are responsible for it.
          </p>
        </Section>

        <Section title="13. Changes to this policy">
          <p>
            We may update this policy from time to time, for example if the app's features change. When we do,
            we will revise the effective date shown at the top of this page. Please review this page
            periodically. Continued use of the app after an update means you accept the revised policy.
          </p>
        </Section>

        <Section title="14. Contact us">
          <p>
            If you have any question about this policy or about how your information is handled, or if you
            wish to make a request about your data, contact us:
          </p>
          <div className="flex flex-col gap-3 mt-1">
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-700 shrink-0">
                <Phone size={16} className="text-indigo-600 dark:text-indigo-400" />
              </span>
              <a href={`tel:${CLINIC.phone.replace(/\s/g, '')}`} className="font-semibold text-slate-900 dark:text-white hover:underline">
                {CLINIC.phone}
              </a>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-700 shrink-0">
                <Mail size={16} className="text-indigo-600 dark:text-indigo-400" />
              </span>
              <a href={`mailto:${CLINIC.email}`} className="font-semibold text-slate-900 dark:text-white hover:underline break-all">
                {CLINIC.email}
              </a>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-700 shrink-0">
                <MapPin size={16} className="text-indigo-600 dark:text-indigo-400" />
              </span>
              <span className="font-semibold text-slate-900 dark:text-white pt-1.5">{CLINIC.address}</span>
            </div>
          </div>
        </Section>

        <footer className="text-center py-4">
          <Link to="/login" className="text-[13px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
            Back to Sign In
          </Link>
          <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-3">
            © {new Date().getFullYear()} {CLINIC.name}
          </p>
        </footer>
      </main>
    </div>
  );
}
