'use client';

import React, { useState, useEffect } from 'react';
import { Shield, CheckCircle2, Clock, XCircle, ArrowLeft, FileText, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import Link from 'next/link';
import { FadeUp, StaggerContainer, StaggerItem } from '@/components/animations';
import { SPRING, EASE_OUT_EXPO } from '@/lib/animations';

interface KycStatus {
  status: 'verified' | 'pending' | 'rejected';
  statusMessage: string;
  submissionDate: string;
  lastUpdated: string;
  documents: Array<{
    name: string;
    status: 'verified' | 'pending' | 'rejected';
  }>;
}

export default function KycStatusPage() {
  const [kycData, setKycData] = useState<KycStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock fetch KYC status
    setTimeout(() => {
      setKycData({
        status: 'verified',
        statusMessage: 'Your KYC has been verified successfully.',
        submissionDate: '2024-01-15',
        lastUpdated: '2024-01-16',
        documents: [
          { name: 'PAN Card', status: 'verified' },
          { name: 'Aadhaar Card', status: 'verified' },
          { name: 'Address Proof', status: 'verified' },
        ],
      });
      setLoading(false);
    }, 300);
  }, []);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'verified':
        return {
          icon: CheckCircle2,
          color: 'text-success',
          bgColor: 'bg-success/10 dark:bg-success/20',
          borderColor: 'border-success/20',
          label: 'Verified',
        };
      case 'pending':
        return {
          icon: Clock,
          color: 'text-warning',
          bgColor: 'bg-warning/10 dark:bg-warning/20',
          borderColor: 'border-warning/20',
          label: 'Pending',
        };
      case 'rejected':
        return {
          icon: XCircle,
          color: 'text-error',
          bgColor: 'bg-error/10 dark:bg-error/20',
          borderColor: 'border-error/20',
          label: 'Rejected',
        };
      default:
        return {
          icon: AlertCircle,
          color: 'text-text-muted',
          bgColor: 'bg-surface-elevated dark:bg-[#242424]',
          borderColor: 'border-border-subtle',
          label: 'Unknown',
        };
    }
  };

  const kycConfig = kycData ? getStatusConfig(kycData.status) : null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border-subtle dark:border-[#2D2D2D]">
        <div className="flex items-center gap-4 p-4 max-w-md mx-auto">
          <Link href="/account">
            <motion.button
              className="p-2 -ml-2 rounded-xl hover:bg-surface-elevated dark:hover:bg-[#242424] transition-colors"
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft className="size-5 text-text-primary dark:text-[#F0F0F0]" />
            </motion.button>
          </Link>
          <h1 className="text-xl font-bold text-text-primary dark:text-[#F0F0F0]">KYC Status</h1>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 max-w-md mx-auto">
        {loading ? (
          <div className="space-y-4">
            <div className="card p-6 animate-pulse">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-surface-elevated dark:bg-[#242424] mb-4" />
                <div className="h-6 w-24 rounded bg-surface-elevated dark:bg-[#242424] mb-2" />
                <div className="h-4 w-48 rounded bg-surface-elevated dark:bg-[#242424]" />
              </div>
            </div>
          </div>
        ) : kycData && kycConfig ? (
          <>
            {/* Status Card */}
            <FadeUp>
              <div className={`card p-6 mb-4 border ${kycConfig.borderColor}`}>
                <div className="flex flex-col items-center text-center">
                  <motion.div
                    className={`w-20 h-20 rounded-full ${kycConfig.bgColor} flex items-center justify-center mb-4`}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.4, ease: EASE_OUT_EXPO }}
                  >
                    <kycConfig.icon className={`size-10 ${kycConfig.color}`} />
                  </motion.div>
                  <h2 className={`text-2xl font-bold ${kycConfig.color} mb-2`}>
                    {kycConfig.label}
                  </h2>
                  <p className="text-text-secondary dark:text-[#9CA3AF]">
                    {kycData.statusMessage}
                  </p>
                </div>
              </div>
            </FadeUp>

            {/* Details */}
            <StaggerContainer staggerDelay={0.06} delayChildren={0.2}>
              <div className="card overflow-hidden mb-4">
                <div className="divide-y divide-border-subtle dark:divide-[#2D2D2D]">
                  <StaggerItem>
                    <div className="p-4 flex justify-between items-center">
                      <span className="text-text-muted dark:text-[#6B7280]">Submission Date</span>
                      <span className="font-semibold text-text-primary dark:text-[#F0F0F0]">
                        {new Date(kycData.submissionDate).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  </StaggerItem>
                  <StaggerItem>
                    <div className="p-4 flex justify-between items-center">
                      <span className="text-text-muted dark:text-[#6B7280]">Last Updated</span>
                      <span className="font-semibold text-text-primary dark:text-[#F0F0F0]">
                        {new Date(kycData.lastUpdated).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  </StaggerItem>
                </div>
              </div>
            </StaggerContainer>

            {/* Documents */}
            <FadeUp delay={0.35}>
              <h3 className="text-sm font-bold text-text-muted dark:text-[#6B7280] mb-3 px-2 uppercase tracking-wider">
                Documents
              </h3>
            </FadeUp>

            <StaggerContainer staggerDelay={0.06} delayChildren={0.4}>
              <div className="space-y-3">
                {kycData.documents.map((doc, index) => {
                  const docConfig = getStatusConfig(doc.status);
                  return (
                    <StaggerItem key={doc.name}>
                      <motion.div
                        className="card p-4"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.4 + index * 0.06, ease: EASE_OUT_EXPO }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-xl ${docConfig.bgColor}`}>
                              <FileText className={`size-5 ${docConfig.color}`} />
                            </div>
                            <span className="font-semibold text-text-primary dark:text-[#F0F0F0]">
                              {doc.name}
                            </span>
                          </div>
                          <span className={`text-sm font-medium ${docConfig.color}`}>
                            {docConfig.label}
                          </span>
                        </div>
                      </motion.div>
                    </StaggerItem>
                  );
                })}
              </div>
            </StaggerContainer>

            {/* Info Note */}
            {kycData.status === 'verified' && (
              <FadeUp delay={0.55}>
                <div className="mt-6 p-4 rounded-2xl border border-success/20 bg-success/5 flex items-start gap-3">
                  <Shield className="size-5 text-success flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-text-secondary dark:text-[#9CA3AF]">
                    Your account is fully verified. You can now buy and sell gold without any restrictions.
                  </p>
                </div>
              </FadeUp>
            )}

            {kycData.status === 'pending' && (
              <FadeUp delay={0.55}>
                <div className="mt-6 p-4 rounded-2xl border border-warning/20 bg-warning/5 flex items-start gap-3">
                  <Clock className="size-5 text-warning flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-text-secondary dark:text-[#9CA3AF]">
                    Your KYC is under review. This usually takes 24-48 hours. We&apos;ll notify you once it&apos;s complete.
                  </p>
                </div>
              </FadeUp>
            )}

            {kycData.status === 'rejected' && (
              <FadeUp delay={0.55}>
                <div className="mt-6 p-4 rounded-2xl border border-error/20 bg-error/5 flex items-start gap-3">
                  <AlertCircle className="size-5 text-error flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-text-secondary dark:text-[#9CA3AF]">
                    Your KYC was rejected. Please contact support for more information.
                  </p>
                </div>
              </FadeUp>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
}
