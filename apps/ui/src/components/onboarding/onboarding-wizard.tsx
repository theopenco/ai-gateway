import { Elements } from "@stripe/react-stripe-js";
import { useNavigate } from "@tanstack/react-router";
import { usePostHog } from "posthog-js/react";
import * as React from "react";
import { useState } from "react";

import { ApiKeyStep } from "./api-key-step";
import { CreditsStep } from "./credits-step";
import { ProviderKeyStep } from "./provider-key-step";
import { WelcomeStep } from "./welcome-step";
import { useDefaultOrganization } from "@/hooks/useOrganization";
import { Card, CardContent } from "@/lib/components/card";
import { Stepper } from "@/lib/components/stepper";
import { useApi } from "@/lib/fetch-client";
import { useStripe } from "@/lib/stripe";

const getSteps = (isProPlan: boolean) => [
	{
		id: "welcome",
		title: "Welcome",
		component: WelcomeStep,
	},
	{
		id: "api-key",
		title: "API Key",
		component: ApiKeyStep,
	},
	{
		id: "provider-key",
		title: "Provider Key",
		component: ProviderKeyStep,
		optional: true,
	},
	...(isProPlan
		? []
		: [
				{
					id: "credits",
					title: "Credits",
					component: CreditsStep,
					optional: true,
				},
			]),
];

export function OnboardingWizard() {
	const [activeStep, setActiveStep] = useState(0);
	const navigate = useNavigate();
	const posthog = usePostHog();
	const { stripe, isLoading: stripeLoading } = useStripe();
	const { data: organization } = useDefaultOrganization();
	const api = useApi();
	const completeOnboarding = api.useMutation(
		"post",
		"/user/me/complete-onboarding",
	);

	const isProPlan = organization?.plan === "pro";
	const STEPS = getSteps(isProPlan);

	const handleStepChange = async (step: number) => {
		if (step >= STEPS.length) {
			posthog.capture("onboarding_completed", {
				completedSteps: STEPS.map((step) => step.id),
			});

			await completeOnboarding.mutateAsync({});
			navigate({ to: "/dashboard" });
			return;
		}
		setActiveStep(step);
	};

	const CurrentStepComponent = STEPS[activeStep].component;

	return (
		<div className="container mx-auto max-w-3xl py-10">
			<Card>
				<CardContent className="p-6 sm:p-8">
					<Stepper
						steps={STEPS.map(({ id, title, optional }) => ({
							id,
							title,
							optional,
						}))}
						activeStep={activeStep}
						onStepChange={handleStepChange}
						className="mb-6"
					>
						{activeStep === 3 && !isProPlan ? (
							stripeLoading ? (
								<div className="p-6 text-center">Loading payment form...</div>
							) : (
								<Elements stripe={stripe}>
									<CurrentStepComponent />
								</Elements>
							)
						) : (
							<CurrentStepComponent />
						)}
					</Stepper>
				</CardContent>
			</Card>
		</div>
	);
}
