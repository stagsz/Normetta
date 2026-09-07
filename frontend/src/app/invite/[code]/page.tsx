'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { betaInviteApi } from '@/lib/api';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Shield, Loader2, AlertCircle, Clock, Users, Link2 } from 'lucide-react';

interface ValidInvite {
  id: string;
  code: string;
  email: string | null;
  maxUses: number;
  usedCount: number;
  expiresAt: string;
  organization: { id: string; name: string; slug: string } | null;
  createdBy: { id: string; firstName: string; lastName: string; email: string };
}

export default function BetaInviteLandingPage() {
  const params = useParams();
  const router = useRouter();
  const code = params?.code as string;
  const setInviteUrl = useOnboardingStore((s) => s.setInviteUrl);
  const setStep = useOnboardingStore((s) => s.setStep);

  const [invite, setInvite] = useState<ValidInvite | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [expired, setExpired] = useState(false);
  const [usedUp, setUsedUp] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tracking, setTracking] = useState(false);

  useEffect(() => {
    if (!code) return;
    
    let mounted = true;
    
    const validateInvite = async () => {
      try {
        const res = await betaInviteApi.validateCode(code);
        const data = res.data?.data;
        
        if (!mounted) return;
        
        if (data.valid) {
          setInvite(data.invite);
          setInviteUrl(`/invite/${code}`);
        } else {
          if (data.reason === 'Invite has expired') {
            setExpired(true);
          } else if (data.reason === 'Invite has been used up') {
            setUsedUp(true);
          } else {
            setNotFound(true);
          }
        }
      } catch {
        if (mounted) setNotFound(true);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    validateInvite();

    return () => { mounted = false; };
  }, [code, setInviteUrl]);

  const handleTrackUsage = async () => {
    if (tracking || !invite) return;
    setTracking(true);
    try {
      await betaInviteApi.trackUsage(code, document.referrer || undefined);
    } catch {
      // Silent fail for tracking
    } finally {
      setTracking(false);
    }
  };

  useEffect(() => {
    if (invite && !tracking) {
      handleTrackUsage();
    }
  }, [invite]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--surface-sunken)] px-4">
        <Card className="w-full max-w-md shadow-[var(--shadow-lg)]">
          <CardContent className="py-12 flex items-center justify-center">
            <Loader2 className="animate-spin text-[var(--text-subtle)]" size={32} />
          </CardContent>
        </Card>
      </div>
    );
  }

  const renderErrorState = (icon: React.ReactNode, title: string, description: string) => (
    <div className="min-h-screen flex items-center justify-center bg-[var(--surface-sunken)] px-4">
      <Card className="w-full max-w-md text-center">
        <CardContent className="py-12">
          <div className="mx-auto w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mb-4">
            {icon}
          </div>
          <h2 className="text-xl font-bold text-[var(--text-strong)] mb-2">{title}</h2>
          <p className="text-[var(--text-muted)]">{description}</p>
        </CardContent>
      </Card>
    </div>
  );

  if (notFound) {
    return renderErrorState(
      <AlertCircle className="w-8 h-8 text-red-600" />,
      'Invalid Invitation Link',
      'This beta invitation link is invalid or has been revoked.'
    );
  }

  if (expired) {
    return renderErrorState(
      <Clock className="w-8 h-8 text-amber-600" />,
      'Invitation Expired',
      'This beta invitation has expired. Please contact the person who invited you for a new link.'
    );
  }

  if (usedUp) {
    return renderErrorState(
      <Users className="w-8 h-8 text-blue-600" />,
      'Invitation Fully Used',
      'This beta invitation has reached its maximum number of uses.'
    );
  }

  if (!invite) {
    return renderErrorState(
      <AlertCircle className="w-8 h-8 text-red-600" />,
      'Unable to Load Invitation',
      'There was an error loading this invitation. Please try again later.'
    );
  }

  const handleContinue = () => {
    router.push(`/register?beta_invite=${code}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--surface-sunken)] py-12 px-4">
      <Card className="w-full max-w-md shadow-[var(--shadow-lg)]">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-14 h-14 bg-[var(--brand-soft)] rounded-2xl flex items-center justify-center mb-4">
            <Shield className="w-8 h-8 text-[var(--brand-strong)]" />
          </div>
          <CardTitle className="text-xl">
            You're Invited to Normetta Beta
          </CardTitle>
          <CardDescription>
            {invite.organization?.name ? `Exclusive access for ${invite.organization.name}` : 'Exclusive beta access'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 mb-6 p-4 bg-[var(--brand-soft)] rounded-lg">
            <div className="flex items-center gap-2 text-[var(--brand)]">
              <CheckCircle size={18} />
              <span className="font-medium">Valid invitation code: <code className="font-mono bg-[var(--brand-soft)] px-1.5 rounded">{invite.code}</code></span>
            </div>
            {invite.email && (
              <div className="flex items-center gap-2 text-[var(--brand)]">
                <Link2 size={18} />
                <span className="font-medium">Reserved for: {invite.email}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-[var(--brand)]">
              <Users size={18} />
              <span className="font-medium">
                {invite.usedCount} of {invite.maxUses} uses • Expires {new Date(invite.expiresAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          <p className="text-[var(--text-muted)] text-center mb-6">
            Create your account to join the Normetta beta program and get early access to our ISO 9001 Quality Management Platform.
          </p>

          <Button onClick={handleContinue} className="w-full" size="lg">
            <CheckCircle size={18} className="mr-2" />
            Continue to Sign Up
          </Button>

          <p className="text-xs text-[var(--text-subtle)] text-center mt-4">
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}