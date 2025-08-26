export default function VerifyRequest() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            이메일을 확인하세요
          </h2>
          <p className="mt-4 text-sm text-gray-600">
            입력하신 이메일 주소로 로그인 링크를 보냈습니다.
            <br />
            이메일을 확인하고 링크를 클릭하여 로그인하세요.
          </p>
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-800">
              💡 이메일이 보이지 않으면 스팸 폴더를 확인해보세요.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}