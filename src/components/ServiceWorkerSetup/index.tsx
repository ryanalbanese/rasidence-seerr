/* eslint-disable no-console */

import useSettings from '@app/hooks/useSettings';
import { useUser } from '@app/hooks/useUser';
import { verifyAndResubscribePushSubscription } from '@app/utils/pushSubscriptionHelpers';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

/**
 * Integrated mode (same origin as rasidence-fe):
 * set NEXT_PUBLIC_USE_PARENT_SERVICE_WORKER=true and serve rasidence-fe's built /sw.js at the same URL.
 *
 * Standalone Seerr (basePath /request): registers /request/sw.js from Next public/.
 */
function getServiceWorkerScriptUrl(): string {
  if (process.env.NEXT_PUBLIC_USE_PARENT_SERVICE_WORKER === 'true') {
    return process.env.NEXT_PUBLIC_PARENT_SW_URL?.trim() || '/sw.js';
  }
  return '';
}

const ServiceWorkerSetup = () => {
  const { user } = useUser();
  const { currentSettings } = useSettings();
  const router = useRouter();

  useEffect(() => {
    if ('serviceWorker' in navigator && user?.id) {
      const configured = getServiceWorkerScriptUrl();
      const swUrl =
        configured ||
        `${router.basePath ?? ''}/sw.js`.replace(/\/+/g, '/');

      navigator.serviceWorker
        .register(swUrl)
        .then(async (registration) => {
          console.log(
            '[SW] Registration successful, scope is:',
            registration.scope
          );

          const pushNotificationsEnabled =
            localStorage.getItem('pushNotificationsEnabled') === 'true';

          // Reset the notifications flag if permissions were revoked
          if (
            Notification.permission !== 'granted' &&
            pushNotificationsEnabled
          ) {
            localStorage.setItem('pushNotificationsEnabled', 'false');
            console.warn(
              '[SW] Push permissions not granted — skipping resubscribe'
            );

            return;
          }

          // Bypass resubscribing if we have manually disabled push notifications
          if (!pushNotificationsEnabled) {
            return;
          }

          const subscription = await registration.pushManager.getSubscription();

          console.log(
            '[SW] Existing push subscription:',
            subscription?.endpoint
          );

          const verified = await verifyAndResubscribePushSubscription(
            user.id,
            currentSettings
          );

          if (verified) {
            console.log('[SW] Push subscription verified or refreshed.');
          } else {
            console.warn(
              '[SW] Push subscription verification failed or not available.'
            );
          }
        })
        .catch(function (error) {
          console.log('[SW] Service worker registration failed, error:', error);
        });
    }
  }, [currentSettings, user, router.basePath]);
  return null;
};

export default ServiceWorkerSetup;
