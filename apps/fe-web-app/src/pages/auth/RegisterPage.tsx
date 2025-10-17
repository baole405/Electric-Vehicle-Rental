import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronLeft, Loader2, ShieldCheck, Upload, UserPlus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shadcn/ui/card";
import { Label } from "@/components/shadcn/ui/label";
import { Input } from "@/components/shadcn/ui/input";
import { Button } from "@/components/shadcn/ui/button";
import { CreateUserSchema, type TCreateUser } from "@/schema/user.schema";
import type { TUser } from "@/schema/user.schema";
import { UserApi } from "@/apis/user.api";
import { useAuthContext } from "@/contexts/auth-context";
import {
  type TCreateUserDocument,
  type TUserDocument,
  UserDocumentStatusSchema,
} from "@/schema/user-document.schema";
import { useUserDocument } from "@/hooks/use-user-document";
import { Textarea } from "@/components/shadcn/ui/textarea";
import { ROUTES } from "@/routes/route.constants";

type Step = 1 | 2 | 3;

type DocumentFormState = {
  identityNumber: string;
  drivingLicenseNumber: string;
  notes: string;
  frontImage: File | null;
  backImage: File | null;
  drivingLicenseImage: File | null;
};

const defaultDocumentState: DocumentFormState = {
  identityNumber: "",
  drivingLicenseNumber: "",
  notes: "",
  frontImage: null,
  backImage: null,
  drivingLicenseImage: null,
};

const toPayload = (userId: string, state: DocumentFormState): TCreateUserDocument => ({
  user: userId,
  documentType: "national_id",
  identityNumber: state.identityNumber,
  drivingLicenseNumber: state.drivingLicenseNumber,
  frontImage: state.frontImage as File,
  backImage: state.backImage as File,
  drivingLicenseImage: state.drivingLicenseImage as File,
});

const RegisterPage = () => {
  const navigate = useNavigate();
  const { setAuth, refreshUser, currentUser, isVerified } = useAuthContext();
  const [step, setStep] = useState<Step>(() => (currentUser ? 2 : 1));
  const [createdUser, setCreatedUser] = useState<TUser | null>(currentUser);
  const [formError, setFormError] = useState<string | null>(null);
  const [docError, setDocError] = useState<string | null>(null);
  const [docState, setDocState] = useState<DocumentFormState>(defaultDocumentState);

  const registerForm = useForm<TCreateUser>({
    resolver: zodResolver(CreateUserSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
  });

  const userId = createdUser?._id ?? "";
  const { data: documentResponse, isLoading: isDocumentLoading, submitDocument } = useUserDocument(
    userId,
  );

  const existingDocument = (documentResponse?.data?.data ?? [])[0] as TUserDocument | undefined;

  const handleRegister = async (values: TCreateUser) => {
    setFormError(null);
    try {
      const { confirmPassword, ...payload } = values;
      const response = await UserApi.createUser(payload);
      const newUser = response.data.data;
      setCreatedUser(newUser);
      setAuth(newUser);
      setStep(2);
    } catch (error) {
      console.error("Failed to register user", error);
      setFormError("Could not create account. Please try again.");
    }
  };

  const handleDocumentInput = (field: keyof DocumentFormState, value: string | File | null) => {
    setDocError(null);
    setDocState((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateDocState = (state: DocumentFormState) => {
    if (!state.identityNumber || !state.drivingLicenseNumber) {
      setDocError("Identity and driving license numbers are required.");
      return false;
    }
    if (!state.frontImage || !state.backImage || !state.drivingLicenseImage) {
      setDocError("All document images must be attached.");
      return false;
    }
    return true;
  };

  const handleSubmitDocuments = () => {
    if (!createdUser) {
      setDocError("Please complete the registration step first.");
      return;
    }
    if (!validateDocState(docState)) {
      return;
    }

    const payload = toPayload(createdUser._id, docState);
    submitDocument.mutate(payload, {
      onSuccess: async () => {
        await refreshUser(createdUser._id);
        setStep(3);
      },
      onError: (error) => {
        console.error("Failed to submit documents", error);
        setDocError("Could not upload documents. Please retry.");
      },
    });
  };

  const renderStepHeader = () => (
    <div className="flex flex-col gap-2 border-b pb-4">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-gray-500">
        <UserPlus className="h-4 w-4" />
        <span>Account onboarding</span>
      </div>
      <div className="flex flex-wrap gap-3 text-sm text-gray-600">
        <span className={step >= 1 ? "font-semibold text-gray-900" : ""}>1. Account details</span>
        <span>›</span>
        <span className={step >= 2 ? "font-semibold text-gray-900" : ""}>
          2. Document verification
        </span>
        <span>›</span>
        <span className={step === 3 ? "font-semibold text-gray-900" : ""}>3. Ready to rent</span>
      </div>
    </div>
  );

  const renderRegistrationForm = () => (
    <form className="space-y-4" onSubmit={registerForm.handleSubmit(handleRegister)}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full name</Label>
          <Input id="fullName" placeholder="Nguyen Van A" {...registerForm.register("fullName")} />
          {registerForm.formState.errors.fullName && (
            <p className="text-sm text-red-500">{registerForm.formState.errors.fullName.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            {...registerForm.register("email")}
          />
          {registerForm.formState.errors.email && (
            <p className="text-sm text-red-500">{registerForm.formState.errors.email.message}</p>
          )}
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            inputMode="tel"
            placeholder="0987 654 321"
            {...registerForm.register("phone")}
          />
          {registerForm.formState.errors.phone && (
            <p className="text-sm text-red-500">{registerForm.formState.errors.phone.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="At least 8 characters"
            {...registerForm.register("password")}
          />
          {registerForm.formState.errors.password && (
            <p className="text-sm text-red-500">{registerForm.formState.errors.password.message}</p>
          )}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm password</Label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="Repeat the password"
          {...registerForm.register("confirmPassword")}
        />
        {registerForm.formState.errors.confirmPassword && (
          <p className="text-sm text-red-500">
            {registerForm.formState.errors.confirmPassword.message}
          </p>
        )}
      </div>
      <Button
        type="submit"
        className="w-full"
        disabled={registerForm.formState.isSubmitting || registerForm.formState.isSubmitting}
      >
        {registerForm.formState.isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating account...
          </>
        ) : (
          "Continue"
        )}
      </Button>
      <p className="text-center text-sm text-gray-600">
        Have an account?{" "}
        <Link to={ROUTES.LOGIN} className="font-semibold text-primary hover:underline">
          Sign in
        </Link>
      </p>
      {formError && <p className="text-sm text-red-500">{formError}</p>}
    </form>
  );

  const renderDocumentUpload = () => {
    const documentStatus = existingDocument?.status;
    const docHumanStatus = documentStatus
      ? documentStatus.charAt(0).toUpperCase() + documentStatus.slice(1).replace("_", " ")
      : "Not submitted";

    const isCurrentDocVerified =
      documentStatus && UserDocumentStatusSchema.options.includes(documentStatus) && documentStatus === "verified";

    return (
      <div className="space-y-6">
        <div className="rounded-md border border-dashed border-gray-200 bg-gray-50 p-4 text-sm">
          <p className="font-medium text-gray-900">Document status: {docHumanStatus}</p>
          <p className="mt-1 text-gray-600">
            Upload the front and back of your ID as well as your driving license. Our staff will
            review and verify the documents before you can pick up a vehicle.
          </p>
        </div>

        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="identityNumber">National ID / Citizen ID</Label>
              <Input
                id="identityNumber"
                placeholder="123456789"
                value={docState.identityNumber}
                onChange={(event) => handleDocumentInput("identityNumber", event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="drivingLicenseNumber">Driving license number</Label>
              <Input
                id="drivingLicenseNumber"
                placeholder="B2-123456"
                value={docState.drivingLicenseNumber}
                onChange={(event) =>
                  handleDocumentInput("drivingLicenseNumber", event.target.value)
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes for staff (optional)</Label>
            <Textarea
              id="notes"
              placeholder="Mention any special documents or conditions for verification."
              value={docState.notes}
              onChange={(event) => handleDocumentInput("notes", event.target.value)}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <DocumentUploadField
              id="frontImage"
              label="ID card - front"
              file={docState.frontImage}
              onChange={(file) => handleDocumentInput("frontImage", file)}
            />
            <DocumentUploadField
              id="backImage"
              label="ID card - back"
              file={docState.backImage}
              onChange={(file) => handleDocumentInput("backImage", file)}
            />
            <DocumentUploadField
              id="drivingLicenseImage"
              label="Driving license"
              file={docState.drivingLicenseImage}
              onChange={(file) => handleDocumentInput("drivingLicenseImage", file)}
            />
          </div>
        </div>

        {docError && <p className="text-sm text-red-500">{docError}</p>}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(ROUTES.ROOT)}
              disabled={submitDocument.isPending}
            >
              Go back home
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={handleSkipDocuments}
              disabled={submitDocument.isPending}
            >
              Skip for now
            </Button>
          </div>
          <Button
            type="button"
            onClick={handleSubmitDocuments}
            disabled={submitDocument.isPending || isCurrentDocVerified}
          >
            {submitDocument.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...
              </>
            ) : isCurrentDocVerified ? (
              "Documents already verified"
            ) : (
              "Submit documents"
            )}
          </Button>
        </div>
      </div>
    );
  };

  const handleSkipDocuments = () => {
    navigate(ROUTES.LOGIN);
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(ROUTES.ROOT);
    }
  };

  const renderCompletion = () => (
    <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
        <ShieldCheck className="h-8 w-8" />
      </div>
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Documents submitted</h2>
        <p className="mt-2 text-sm text-gray-600">
          We are reviewing your documents. You will receive an email once the verification is
          complete. You can now explore vehicles, but booking will unlock after approval.
        </p>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button variant="outline" onClick={() => navigate(ROUTES.PROFILE)}>
          View profile
        </Button>
        <Button onClick={() => navigate(ROUTES.VEHICLE)}>Browse vehicles</Button>
      </div>
    </div>
  );

  const renderContent = () => {
    if (isVerified) {
      return renderCompletion();
    }

    if (step === 1) {
      return renderRegistrationForm();
    }

    if (step === 2) {
      return isDocumentLoading && !existingDocument ? (
        <div className="flex items-center justify-center py-12 text-gray-600">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Loading document status...
        </div>
      ) : (
        renderDocumentUpload()
      );
    }

    return renderCompletion();
  };

  return (
    <div className="relative min-h-screen bg-gray-50">
      <div className="absolute left-4 top-4 z-10">
        <Button variant="ghost" size="sm" onClick={handleBack} className="gap-2">
          <ChevronLeft className="h-4 w-4" />
          Home
        </Button>
      </div>
      <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-16">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-gray-900">Get started with EVrent</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {renderStepHeader()}
            {renderContent()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const DocumentUploadField = ({
  id,
  label,
  file,
  onChange,
}: {
  id: string;
  label: string;
  file: File | null;
  onChange: (value: File | null) => void;
}) => (
  <label
    htmlFor={id}
    className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 bg-white p-6 text-center text-sm hover:border-gray-400"
  >
    <Upload className="h-6 w-6 text-gray-500" />
    <span className="font-medium text-gray-900">{label}</span>
    <span className="text-xs text-gray-500">
      {file ? `${file.name} (${(file.size / 1024).toFixed(0)} KB)` : "Click to upload JPG or PNG"}
    </span>
    <input
      id={id}
      type="file"
      accept="image/*"
      className="hidden"
      onChange={(event) => {
        const selectedFile = event.target.files?.[0] ?? null;
        onChange(selectedFile);
      }}
    />
  </label>
);

export default RegisterPage;
