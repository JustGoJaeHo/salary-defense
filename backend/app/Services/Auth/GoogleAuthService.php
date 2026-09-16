<?php

namespace App\Services\Auth;

use App\Exceptions\GoogleAccountAlreadyLinkedException;
use App\Models\User;
use Illuminate\Contracts\Encryption\DecryptException;
use Illuminate\Support\Facades\Crypt;
use Laravel\Socialite\Contracts\User as SocialiteUser;

class GoogleAuthService
{
    private const LINK_TICKET_TTL_MINUTES = 5;

    public function createLinkTicket(User $guest): string
    {
        return Crypt::encryptString(json_encode([
            'user_id' => $guest->id,
            'expires_at' => now()->addMinutes(self::LINK_TICKET_TTL_MINUTES)->timestamp,
        ]));
    }

    public function resolveLinkTicket(?string $ticket): ?User
    {
        if ($ticket === null) {
            return null;
        }

        try {
            $payload = json_decode(Crypt::decryptString($ticket), true);
        } catch (DecryptException) {
            return null;
        }

        if (($payload['expires_at'] ?? 0) < now()->timestamp) {
            return null;
        }

        $guest = User::find($payload['user_id'] ?? null);

        return $guest?->is_guest ? $guest : null;
    }

    /**
     * Find or create a user for the given Google account, or upgrade the
     * guest passed in $guestToLink into that Google account.
     *
     * @throws GoogleAccountAlreadyLinkedException when the Google account is
     *                                             already linked to a different, non-guest user.
     */
    public function loginOrLink(SocialiteUser $googleUser, ?User $guestToLink): User
    {
        $existing = User::where('google_id', $googleUser->getId())->first();

        if ($guestToLink) {
            if ($existing && $existing->isNot($guestToLink)) {
                throw new GoogleAccountAlreadyLinkedException;
            }

            $guestToLink->update([
                'google_id' => $googleUser->getId(),
                'email' => $googleUser->getEmail(),
                'name' => $googleUser->getName() ?: $guestToLink->name,
                'is_guest' => false,
            ]);

            return $guestToLink->fresh();
        }

        if ($existing) {
            return $existing;
        }

        return User::create([
            'google_id' => $googleUser->getId(),
            'email' => $googleUser->getEmail(),
            'name' => $googleUser->getName() ?: 'Google User',
            'is_guest' => false,
        ]);
    }
}
