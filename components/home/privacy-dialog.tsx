"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useState } from "react"

interface PrivacyDialogProps {
  trigger: React.ReactNode
}

export function PrivacyDialog({ trigger }: PrivacyDialogProps) {
  const [open, setOpen] = useState(false)
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Privacy Policy</DialogTitle>
          <DialogDescription>
            Last updated: June 1, 2025
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4 text-sm">
          <h3 className="text-lg font-medium">1. Introduction</h3>
          <p>
            QuantHive ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our services.
          </p>

          <h3 className="text-lg font-medium">2. Information We Collect</h3>
          <p>
            We collect information that you provide directly to us, such as when you create an account, use our services, contact customer support, or otherwise communicate with us. This information may include your name, email address, phone number, financial information, and any other information you choose to provide.
          </p>

          <h3 className="text-lg font-medium">3. How We Use Your Information</h3>
          <p>
            We use the information we collect to:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Provide, maintain, and improve our services</li>
            <li>Process transactions and send related information</li>
            <li>Send you technical notices, updates, security alerts, and support messages</li>
            <li>Respond to your comments, questions, and customer service requests</li>
            <li>Develop new products and services</li>
            <li>Monitor and analyze trends, usage, and activities</li>
          </ul>

          <h3 className="text-lg font-medium">4. Data Security</h3>
          <p>
            We implement appropriate technical and organizational measures to protect the security of your personal information. However, please be aware that no method of transmission over the internet or electronic storage is 100% secure.
          </p>

          <h3 className="text-lg font-medium">5. Your Rights</h3>
          <p>
            Depending on your location, you may have certain rights regarding your personal information, such as the right to access, correct, or delete your personal information.
          </p>

          <h3 className="text-lg font-medium">6. Changes to This Privacy Policy</h3>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
          </p>

          <h3 className="text-lg font-medium">7. Contact Us</h3>
          <p>
            If you have any questions about this Privacy Policy, please contact us at info@quanthive.in.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
} 