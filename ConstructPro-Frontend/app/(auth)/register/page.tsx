"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { useAuth } from "@/lib/hooks/useAuth"
import { registerSchema, type RegisterFormData } from "@/lib/validations/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Role } from "@/types/user"
import { ROLE_LABELS } from "@/lib/constants"
import { Loader2 } from "lucide-react"
import { useState } from "react"

export default function RegisterPage() {
  const { register: registerUser, isRegistering } = useAuth()
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = (data: RegisterFormData) => {
    registerUser(data)
  }

  const handleRoleChange = (value: string) => {
    const role = parseInt(value) as Role
    setSelectedRole(role)
    setValue("roleName", role)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Create Account
          </CardTitle>
          <CardDescription className="text-center">
            Register for ConstructPro - Your registration will be reviewed by an administrator
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  {...register("name")}
                  disabled={isRegistering}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  {...register("email")}
                  disabled={isRegistering}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  placeholder="+1234567890"
                  {...register("phoneNumber")}
                  disabled={isRegistering}
                />
                {errors.phoneNumber && (
                  <p className="text-sm text-destructive">{errors.phoneNumber.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="roleName">Role</Label>
                <Select onValueChange={handleRoleChange} disabled={isRegistering}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={Role.ProjectManager.toString()}>
                      {ROLE_LABELS[Role.ProjectManager]}
                    </SelectItem>
                    <SelectItem value={Role.SiteEngineer.toString()}>
                      {ROLE_LABELS[Role.SiteEngineer]}
                    </SelectItem>
                    <SelectItem value={Role.Client.toString()}>
                      {ROLE_LABELS[Role.Client]}
                    </SelectItem>
                  </SelectContent>
                </Select>
                {errors.roleName && (
                  <p className="text-sm text-destructive">{errors.roleName.message}</p>
                )}
              </div>
            </div>

            {/* Role-specific fields */}
            {selectedRole === Role.ProjectManager && (
              <div className="space-y-2">
                <Label htmlFor="experienceYears">Years of Experience</Label>
                <Input
                  id="experienceYears"
                  type="number"
                  placeholder="5"
                  {...register("experienceYears", { valueAsNumber: true })}
                  disabled={isRegistering}
                />
                {errors.experienceYears && (
                  <p className="text-sm text-destructive">{errors.experienceYears.message}</p>
                )}
              </div>
            )}

            {selectedRole === Role.SiteEngineer && (
              <div className="space-y-2">
                <Label htmlFor="skills">Skills</Label>
                <Input
                  id="skills"
                  placeholder="e.g., Civil Engineering, AutoCAD, Project Planning"
                  {...register("skills")}
                  disabled={isRegistering}
                />
                {errors.skills && (
                  <p className="text-sm text-destructive">{errors.skills.message}</p>
                )}
              </div>
            )}

            {selectedRole === Role.Client && (
              <div className="space-y-2">
                <Label htmlFor="projectName">Project Name</Label>
                <Input
                  id="projectName"
                  placeholder="e.g., Downtown Office Complex"
                  {...register("projectName")}
                  disabled={isRegistering}
                />
                {errors.projectName && (
                  <p className="text-sm text-destructive">{errors.projectName.message}</p>
                )}
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Your registration request will be sent to an administrator for approval. 
                You'll receive an email once your account is activated.
              </p>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full"
              disabled={isRegistering}
            >
              {isRegistering ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Registration"
              )}
            </Button>

            <p className="text-sm text-center text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline font-medium">
                Sign in here
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
