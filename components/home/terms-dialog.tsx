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

interface TermsDialogProps {
  trigger: React.ReactNode
}

export function TermsDialog({ trigger }: TermsDialogProps) {
  const [open, setOpen] = useState(false)
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Terms of Service</DialogTitle>
          <DialogDescription>
            Last updated: June 1, 2025
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4 text-sm">
          <h3 className="text-lg font-medium">1. Acceptance of Terms</h3>
          <p>
            By accessing or using the QuantHive service ("Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you may not use the Service.
          </p>

          <h3 className="text-lg font-medium">2. Description of Service</h3>
          <p>
            The Service is a financial analysis platform that allows users to test investment ideas, analyze financial data, and visualize investment performance. The Service is provided on an "as is" and "as available" basis.
          </p>

          <h3 className="text-lg font-medium">3. User Accounts</h3>
          <p>
            You must create an account to use certain features of the Service. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must immediately notify us of any unauthorized use of your account.
          </p>

          <h3 className="text-lg font-medium">4. User Conduct</h3>
          <p>
            You agree not to:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Use the Service for any illegal purpose or in violation of any laws</li>
            <li>Attempt to gain unauthorized access to any part of the Service</li>
            <li>Interfere with or disrupt the Service or servers connected to the Service</li>
            <li>Collect or store personal data about other users without their consent</li>
            <li>Use the Service to transmit any viruses, malware, or other harmful code</li>
          </ul>

          <h3 className="text-lg font-medium">5. Intellectual Property</h3>
          <p>
            The Service and all content and materials included on the Service, including, but not limited to, text, graphics, logos, button icons, images, audio clips, data compilations, and software, are the property of QuantHive or its licensors and are protected by copyright, trademark, and other intellectual property laws.
          </p>

          <h3 className="text-lg font-medium">6. Disclaimer of Warranties</h3>
          <p>
            THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. TO THE FULLEST EXTENT PERMISSIBLE UNDER APPLICABLE LAW, QUANTHIVE DISCLAIMS ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING, BUT NOT LIMITED TO, IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
          </p>

          <h3 className="text-lg font-medium">7. Limitation of Liability</h3>
          <p>
            IN NO EVENT SHALL QUANTHIVE BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, PUNITIVE, OR CONSEQUENTIAL DAMAGES WHATSOEVER RESULTING FROM ANY (I) ERRORS, MISTAKES, OR INACCURACIES OF CONTENT, (II) PERSONAL INJURY OR PROPERTY DAMAGE, OF ANY NATURE WHATSOEVER, RESULTING FROM YOUR ACCESS TO AND USE OF THE SERVICE, (III) ANY UNAUTHORIZED ACCESS TO OR USE OF OUR SECURE SERVERS AND/OR ANY AND ALL PERSONAL INFORMATION AND/OR FINANCIAL INFORMATION STORED THEREIN.
          </p>

          <h3 className="text-lg font-medium">8. Modifications to Terms</h3>
          <p>
            We reserve the right to modify these Terms at any time. If we make changes to these Terms, we will provide notice of such changes by updating the "Last updated" date at the top of these Terms. Your continued use of the Service following the posting of revised Terms means that you accept and agree to the changes.
          </p>

          <h3 className="text-lg font-medium">9. Governing Law</h3>
          <p>
            These Terms shall be governed by and construed in accordance with the laws of the United States, without regard to its conflict of law provisions.
          </p>

          <h3 className="text-lg font-medium">10. Contact Us</h3>
          <p>
            If you have any questions about these Terms, please contact us at info@quanthive.in.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
} 