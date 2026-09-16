<?php

namespace App\Http\Controllers\Auth;

use App\Exceptions\GoogleAccountAlreadyLinkedException;
use App\Http\Controllers\Controller;
use App\Services\Auth\GoogleAuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;
use Laravel\Socialite\Facades\Socialite;
use Throwable;

class GoogleAuthController extends Controller
{
    public function __construct(private readonly GoogleAuthService $googleAuthService) {}

    public function ticket(Request $request): JsonResponse
    {
        $user = $request->user();

        if (! $user->is_guest) {
            return response()->json([
                'message' => '이미 구글 계정으로 로그인된 사용자입니다.',
            ], 422);
        }

        return response()->json([
            'ticket' => $this->googleAuthService->createLinkTicket($user),
        ]);
    }

    public function redirect(Request $request): RedirectResponse
    {
        $driver = Socialite::driver('google')->stateless();

        // stateless() 모드는 Socialite의 자체 CSRF state 검증을 비활성화하므로,
        // OAuth `state` 파라미터는 CSRF 방지 용도가 아니라 게스트 연동 티켓을
        // 왕복 전달하는 용도로 자유롭게 사용됩니다.
        if ($request->query('ticket')) {
            $driver->with(['state' => $request->query('ticket')]);
        }

        return $driver->redirect();
    }

    public function callback(Request $request): View
    {
        // redirect() 참고: `state`는 CSRF 토큰이 아니라 게스트 연동 티켓입니다.
        $guestToLink = $this->googleAuthService->resolveLinkTicket($request->query('state'));

        try {
            $googleUser = Socialite::driver('google')->stateless()->user();
        } catch (Throwable) {
            return $this->callbackView(success: false, message: '구글 로그인에 실패했습니다.');
        }

        try {
            $user = $this->googleAuthService->loginOrLink($googleUser, $guestToLink);
        } catch (GoogleAccountAlreadyLinkedException) {
            return $this->callbackView(success: false, message: '이미 다른 계정에 연결된 구글 계정입니다.');
        }

        if ($guestToLink) {
            $guestToLink->tokens()->delete();
        }

        return $this->callbackView(
            success: true,
            token: $user->createToken('google')->plainTextToken,
            user: [
                'id' => $user->id,
                'name' => $user->name,
                'is_guest' => $user->is_guest,
            ],
        );
    }

    private function callbackView(bool $success, ?string $token = null, ?array $user = null, ?string $message = null): View
    {
        return view('auth.google-callback', [
            'result' => [
                'type' => 'google-auth',
                'success' => $success,
                'token' => $token,
                'user' => $user,
                'message' => $message,
            ],
        ]);
    }
}
